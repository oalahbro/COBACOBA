require("dotenv").config();
const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");
const axios = require("axios");

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

async function testGoogleSheets() {
  try {
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);

    await doc.loadInfo();

    console.log("✅ Google Sheets Connected");
    console.log("Title:", doc.title);
    
    const sheet = doc.sheetsByIndex[2]; // or use `doc.sheetsById[id]` or `doc.sheetsByTitle[title]`
    console.log(sheet.title);
    const rows = await sheet.getRows();
    rows[1].assign({ MaxHarian: '50000', TargetTabungan: '1000' })
    await rows[1].save(); // save updates on a row

  } catch (error) {
    console.error("❌ Error connecting to Google Sheets:", error);
  }
}

(async () => {
  await testGoogleSheets();
})();
