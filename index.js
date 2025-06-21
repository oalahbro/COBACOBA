require("dotenv").config();
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require("baileys");
const pino = require("pino");
const schedule = require("node-schedule");
const { appendTransaksi, getTarget, setTarget, laporanHariIni, overwriteTarget, hapusTransaksiRow, setIncome, getIncomeData, } = require("./googleSheet");
const { analisisAI } = require("./aiReport");
const qrcode = require("qrcode-terminal");
const pendingConfirmations = {}; // key = user, value = { total, bulan, tahun }

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: "silent" }),
    markOnlineOnConnect: true,
    browser: ["PengeluaranBot", "Chrome", "1.0"],
  });

  sock.ev.on("creds.update", saveCreds);

sock.ev.on("connection.update", (update) => {
  const { connection, lastDisconnect, qr } = update;

  if (qr) {
    console.log("📱 Scan QR berikut untuk login:\n");
     qrcode.generate(qr, { small: true });
    console.log(qr);
  }

  if (connection === "close") {
    const shouldReconnect = (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut);
    console.log("❗ Connection closed. Reconnecting:", shouldReconnect);
    if (shouldReconnect) startBot();
  } else if (connection === "open") {
    console.log("✅ Connected to WhatsApp");
  }
});

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
// console.log("📩 Message received:", messages);

    if (type !== "notify") return;

    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const sender = msg.key.remoteJid;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

    try {
        if (pendingConfirmations[sender]) {
        const response = text.toLowerCase();

        if (response === "ya") {
            const { total, bulan, tahun } = pendingConfirmations[sender];
            await overwriteTarget(sender, total, bulan, tahun);
            await sock.sendMessage(sender, { text: `✅ Target untuk ${bulan}/${tahun} berhasil diganti.` });
        } else if (response === "tidak") {
            await sock.sendMessage(sender, { text: `❌ Perubahan target dibatalkan.` });
        }

        delete pendingConfirmations[sender]; // hapus konfirmasi setelah dijawab
        return;
    // }
    //     else if (text.startsWith("+")) {
    //       const parts = text.substring(1).split(" ");
    //       const kategori = parts[0] || "Umum";
    //       const nominal = parseFloat(parts[1] || "0");
    //       const deskripsi = parts.slice(2).join(" ") || "-";

    //       // Panggil fungsi appendTransaksi, modifikasi biar return ID
    //       const transaksi = await appendTransaksi(sender, kategori, nominal, deskripsi);
    //       await sock.sendMessage(sender, {
    //         text: `✅ Pengeluaran dicatat:\n${kategori} - Rp${nominal} (${deskripsi})\n🆔 : ${transaksi.ID}`,
    //       });
        
      } else if (text.toLowerCase() === "ringkasan hari ini") {
        const data = await laporanHariIni(sender);
        const total = data.reduce((acc, item) => acc + parseFloat(item.Nominal), 0);
        let summary = data.map((r) => `• ${r.Kategori} - Rp${r.Nominal} (${r.Deskripsi})`).join("\n");
        summary = summary || "Tidak ada transaksi hari ini.";
        await sock.sendMessage(sender, { text: `📅 Ringkasan Hari Ini:\n${summary}\n\nTotal: Rp${total}` });

      } else if (text.toLowerCase().startsWith("target ")) {
        const [, total, bulan, tahun] = text.split(" ");
        const result = await setTarget(sender, parseFloat(total), parseInt(bulan), parseInt(tahun), (msg) =>
            sock.sendMessage(sender, { text: msg })
        );

        if (result === "EXISTS") {
            pendingConfirmations[sender] = {
        total: parseFloat(total),
        bulan: parseInt(bulan),
        tahun: parseInt(tahun),
      };
      await sock.sendMessage(sender, { text: "❓ Kirim *ya* untuk konfirmasi ganti target. *tidak* untuk membatalkan" });
    }
      return;

    } else if (text.toLowerCase() === "progress target") {
        const target = await getTarget(sender);
        if (!target) return await sock.sendMessage(sender, { text: "❗ Anda belum menetapkan target." });

        const data = await laporanHariIni(sender);
        const total = data.reduce((acc, item) => acc + parseFloat(item.Nominal), 0);
        const now = new Date();
        const sisaBulan = (parseInt(target.TahunAkhir) - now.getFullYear()) * 12 + (parseInt(target.BulanAkhir) - (now.getMonth() + 1));
        const sisaTabungan = parseFloat(target.TotalTarget) - total;
        const tabunganPerBulan = (sisaTabungan / Math.max(sisaBulan, 1)).toFixed(0);

        await sock.sendMessage(sender, {
          text: `🎯 Target Anda: Rp${target.TotalTarget}\n💰 Terkumpul: Rp${total}\n📅 Sisa waktu: ${sisaBulan} bulan\n💸 Nabung per bulan: Rp${tabunganPerBulan}`
        });

    } else if (text.toLowerCase() === "hapus pengeluaran") {
        const data = await laporanHariIni(sender);

        if (data.length === 0) {
          await sock.sendMessage(sender, { text: "⚠️ Tidak ada pengeluaran hari ini." });
          return;
        }

        const list = data
          .map((r, i) => `${i + 1}. ${r.Kategori} - Rp${r.Nominal} (${r.Deskripsi})`)
          .join("\n");

        await sock.sendMessage(sender, {
          text: `🗑️ *Daftar Pengeluaran Hari Ini:*\n\n${list}\n\n➡️ *Balas pesan ini* dengan nomor transaksi untuk menghapus.`,
        });
        return;
      }
      
    else if (msg?.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        const quoted = msg.message.extendedTextMessage.contextInfo.quotedMessage;

        let quotedText = "";
        if (quoted.conversation) {
          quotedText = quoted.conversation;
        } else if (quoted.extendedTextMessage?.text) {
          quotedText = quoted.extendedTextMessage.text;
        }

      if (quotedText.includes("Daftar Pengeluaran Hari Ini")) {
        const nomor = parseInt(text.trim());
        if (isNaN(nomor)) {
          await sock.sendMessage(sender, { text: "❗ Format tidak valid. Contoh: 2" });
          return;
        }

        const data = await laporanHariIni(sender);
        const transaksi = data[nomor - 1];

        if (!transaksi) {
          await sock.sendMessage(sender, { text: `❗ Transaksi nomor ${nomor} tidak ditemukan.` });
          return;
        }

        const success = await hapusTransaksiRow(transaksi);
        if (success) {
          await sock.sendMessage(sender, {
            text: `✅ Transaksi berhasil dihapus:\n${transaksi.Kategori} - Rp${transaksi.Nominal} (${transaksi.Deskripsi})`
          });
        } else {
          await sock.sendMessage(sender, { text: `❗ Gagal menghapus transaksi.` });
        }
        return;
      }
    }

    //income session
    else if (text.toLowerCase().startsWith("set income")) {
      const regex = /^set income (\d+)\s+tabungan\s+(\d+)/i;
      const match = text.match(regex);

      if (!match) {
        await sock.sendMessage(sender, { text: "❗ Format salah.\nContoh: set income 5000000 tabungan 1000000" });
        return;
      }

      const [, totalIncome, targetTabungan] = match;
      await setIncome(sender, parseInt(totalIncome), parseInt(targetTabungan), (msg) =>
        sock.sendMessage(sender, { text: msg })
      );
    }

    else if (text.startsWith("+")) {
      const parts = text.substring(1).split(" ");
      const kategori = parts[0] || "Umum";
      const nominal = parseFloat(parts[1] || "0");
      const deskripsi = parts.slice(2).join(" ") || "-";

      const incomeData = await getIncomeData(sender);
      console.log(incomeData);
      let alertShown = false;

      if (incomeData && incomeData.MaxHarian) {
        const maxHarian = parseFloat(incomeData.MaxHarian || 0);
        const today = new Date().toISOString().slice(0, 10);
        const transaksiHariIni = await laporanHariIni(sender);
        const totalHariIni = transaksiHariIni.reduce((acc, r) => acc + parseFloat(r.Nominal || 0), 0);
        if (totalHariIni + nominal > maxHarian) {
          
          await sock.sendMessage(sender, {
            text: `⚠️ Pengeluaran melebihi batas harian!\n💸 Batas: Rp${maxHarian.toLocaleString()}\n📅 Hari ini: Rp${totalHariIni.toLocaleString()}\n🛒 Yang akan dicatat: Rp${nominal.toLocaleString()}`
          });
          alertShown = true;
        }
      }

      await appendTransaksi(sender, kategori, nominal, deskripsi);
      await sock.sendMessage(sender, {
        text: `✅ Pengeluaran dicatat:\n${kategori} - Rp${nominal.toLocaleString()} (${deskripsi})${alertShown ? "\n⚠️ Perhatikan batas harian Anda!" : ""}`
      });
    }


    } catch (error) {
      console.error("❌ Error handling message:", error);
      await sock.sendMessage(sender, { text: "❗ Terjadi kesalahan, coba lagi nanti." });
    }
  });



  // Jadwal analisis AI setiap jam 9 malam
  schedule.scheduleJob("0 21 * * *", async () => {
    const nomorAdmin = "62xxxxxxxxxx@s.whatsapp.net"; // Ganti dengan nomor Anda
    const data = await laporanHariIni(nomorAdmin);
    if (data.length === 0) return;

    let summary = data.map((r) => `${r.Kategori}: Rp${r.Nominal} (${r.Deskripsi})`).join("\n");
    const aiResponse = await analisisAI(`Berikan analisis pengeluaran dari data berikut:\n${summary}`);
    await sock.sendMessage(nomorAdmin, { text: `🤖 Analisis Pengeluaran Hari Ini:\n${aiResponse}` });
  });
}

startBot();
