const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");
const dayjs = require("dayjs");

function mapRow(row) {
  return {
    ID: row._rawData[0],
    Timestamp: row._rawData[1],
    User: row._rawData[2],
    Kategori: row._rawData[3],
    Nominal: row._rawData[4],
    Deskripsi: row._rawData[5],
  };
}

function generateCustomID(date = new Date()) {
  const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const month = monthNames[date.getMonth()];
  
  const year = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const HH = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");

  return `${month}${year}${MM}${dd}${HH}${mm}${ss}`;
}

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

async function initDoc() {
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle["Target"];
  await sheet.setHeaderRow(['User', 'TotalTarget', 'BulanAkhir', 'TahunAkhir']);
  return doc;
}

async function appendTransaksi(user, kategori, nominal, deskripsi) {
  const doc = await initDoc();
  const sheet = doc.sheetsByTitle["Transaksi"];
  const now = new Date();
  const newRow= {
    ID: generateCustomID(now), // ← ID unik untuk tiap transaksi
    Timestamp: new Date().toISOString(),
    User: user,
    Kategori: kategori,
    Nominal: nominal,
    Deskripsi: deskripsi,
  };
  const row = await sheet.addRow(newRow);
  return mapRow(row);
}

async function getTarget(user) {
  const doc = await initDoc();
  const sheet = doc.sheetsByTitle["Target"];
  const rows = await sheet.getRows();
  return rows.find((r) => r.User === user);
}

async function setTarget(user, total, bulan, tahun, sendResponse) {
  const doc = await initDoc();
  const sheet = doc.sheetsByTitle["Target"];
  const rows = await sheet.getRows();

  // Cek apakah sudah ada target dengan bulan/tahun yang sama
  const existing = rows.find(
    (r) =>
      (r.User || r._rawData[0]) === user &&
      (r.BulanAkhir?.toString() || r._rawData[2]?.toString()) === bulan.toString() &&
      (r.TahunAkhir?.toString() || r._rawData[3]?.toString()) === tahun.toString()
  );

  if (existing) {
    if (sendResponse) {
      await sendResponse(
        `⚠️ Anda sudah memiliki target untuk ${bulan}/${tahun}.\nApakah Anda yakin ingin mengganti target tersebut?`
      );
    }
    return "EXISTS"; // tanda sudah ada, handle di pemanggil
  }

  await sheet.addRow({
    User: user,
    TotalTarget: total,
    BulanAkhir: bulan,
    TahunAkhir: tahun,
  });

  if (sendResponse) {
    await sendResponse(`✅ Target disimpan: Rp${total} hingga ${bulan}/${tahun}`);
  }

  return "ADDED";
}

async function overwriteTarget(user, total, bulan, tahun, sendResponse) {
  const doc = await initDoc();
  const sheet = doc.sheetsByTitle["Target"];
  const rows = await sheet.getRows();

  const existing = rows.find(
    (r) =>
      (r.User || r._rawData[0]) === user &&
      parseInt(r.BulanAkhir || r._rawData[2]) === bulan &&
      parseInt(r.TahunAkhir || r._rawData[3]) === tahun
  );

  if (!existing) {
    if (sendResponse) {
      await sendResponse(`❗ Target tidak ditemukan untuk ${bulan}/${tahun}.`);
    }
    return "NOT_FOUND";
  }


  // Ganti langsung property di row
  if ("TotalTarget" in existing) {
    existing.TotalTarget = total;
  } else {
    // fallback kalau entah kenapa nggak ada properti
    existing._rawData[1] = total;
  }

  await existing.save();

  console.log("✅ After update:", existing._rawData);

  if (sendResponse) {
    await sendResponse(`✅ Target untuk ${bulan}/${tahun} berhasil diganti menjadi Rp${total}`);
  }
  return "UPDATED";
}


async function laporanHariIni(user) {
  const doc = await initDoc();
  const sheet = doc.sheetsByTitle["Transaksi"];
  sheet.headerRow = 1;
  const rows = await sheet.getRows();

  const today = new Date().toISOString().slice(0, 10);
  return rows
    .map((r) => ({
      ID: r.Timestamp || r._rawData[0],
      Timestamp: r.Timestamp || r._rawData[1],
      User: r.User || r._rawData[2],
      Kategori: r.Kategori || r._rawData[3],
      Nominal: r.Nominal || r._rawData[4],
      Deskripsi: r.Deskripsi || r._rawData[5],
    }))
    
    .filter((r) => r.Timestamp?.startsWith(today) && r.User === user);
}

async function hapusTransaksiRow(transaksi) {
  const doc = await initDoc();
  const sheet = doc.sheetsByTitle["Transaksi"];
  const rows = await sheet.getRows();

  rows.forEach((r, i) => {
    console.log(`Row ${i + 1}:`, r._rawData);
  });

  const row = rows.find(r => 
    (r.User || r._rawData[2]) === transaksi.User && 
    (r.Timestamp || r._rawData[1]) === transaksi.Timestamp
  );

  if (row) {
    await row.delete();
    return true;
  } else {
    return false;
  }
}

//session income
async function setIncome(user, totalIncome, targetTabungan, sendResponse) {
  const doc = await initDoc();
  const sheet = doc.sheetsByTitle["Income"];

  const now = new Date();
  const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`; // contoh: 2025-06

  // Cek apakah sudah ada income untuk bulan ini
  const rows = await sheet.getRows();
  const existing = rows.find(r => (r.User || r._rawData[0]) === user && (r.Timestamp || r._rawData[1]) === timestamp);

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const maxHarian = Math.floor((totalIncome - targetTabungan) / daysInMonth);

  if (existing) {
    existing.IncomeBulan = totalIncome;
    existing.TargetTabungan = targetTabungan;
    existing.MaxHarian = maxHarian;
    await existing.save();

    if (sendResponse) {
      await sendResponse(`✅ Income bulan ini diperbarui.\n💰 Income: Rp${totalIncome}\n🎯 Target tabungan: Rp${targetTabungan}\n💸 Max pengeluaran harian: Rp${maxHarian}`);
    }
  } else {
    await sheet.addRow({
      User: user,
      BulanAwal: timestamp,
      IncomeBulan: totalIncome,
      TargetTabungan: targetTabungan,
      MaxHarian: maxHarian,
    });

    if (sendResponse) {
      await sendResponse(`✅ Income bulan ${timestamp} disimpan.\n💰 Income: Rp${totalIncome}\n🎯 Target tabungan: Rp${targetTabungan}\n💸 Max pengeluaran harian: Rp${maxHarian}`);
    }
  }
}

async function getIncomeData(user) {
  const doc = await initDoc();
  const sheet = doc.sheetsByTitle["Income"];
  const rows = await sheet.getRows();

  const bulanAwal = dayjs().startOf("month").format("YYYY-MM"); // format sesuai datamu: 2025-06

  const foundRow = rows.find((r) => {
    const rowUser = r.User || r._rawData[0];
    const rowBulan = r.BulanAwal || r._rawData[1];
    return rowUser === user && rowBulan === bulanAwal;
  });

  if (!foundRow) return null;

  const headers = foundRow._worksheet._headerValues;

  const dataObj = {};
  headers.forEach((header, index) => {
    dataObj[header] = foundRow._rawData[index];
  });

  return dataObj;
}
module.exports = {
  appendTransaksi,
  getTarget,
  setTarget,
  laporanHariIni,
  overwriteTarget,
  hapusTransaksiRow,
  setIncome,
  getIncomeData,
};
