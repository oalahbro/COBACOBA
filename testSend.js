require("dotenv").config();
const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");
const axios = require("axios");

// Setup Auth Google Sheets
const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

async function sendToGoogleSheets(data) {
  try {
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0]; // gunakan sheet pertama
    await sheet.addRow(data);

    console.log("✅ Data berhasil ditambahkan ke Google Sheets");
  } catch (error) {
    console.error("❌ Error kirim ke Google Sheets:", error);
  }
}

// async function sendToOpenAI(prompt) {
//   try {
//     const response = await axios.post(
//       "https://api.openai.com/v1/chat/completions",
//       {
//         model: "gpt-4o",
//         messages: [{ role: "user", content: prompt }],
//         temperature: 0.3,
//         max_tokens: 200,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     const aiReply = response.data.choices[0].message.content.trim();
//     console.log("✅ OpenAI Response:", aiReply);
//     return aiReply;
//   } catch (error) {
//     console.error("❌ Error kirim ke OpenAI:", error.response?.data || error);
//   }
// }

(async () => {
  const contohData = {
  Timestamp: new Date().toISOString().split("T")[0], // tanggal → Timestamp
  User: "Eka",                                        // kamu bisa isi nama user
  Kategori: "Transportasi",
  Nominal: 150000,
  Deskripsi: "Beli bensin",
};

//   const prompt = `Tolong analisis pengeluaran berikut:\nDeskripsi: ${contohData.deskripsi}\nNominal: ${contohData.nominal}\nKategori: ${contohData.kategori}`;

  await sendToGoogleSheets(contohData);
//   await sendToOpenAI(prompt);
})();
