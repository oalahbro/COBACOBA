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
  } catch (error) {
    console.error("❌ Error connecting to Google Sheets:", error);
  }
}

async function testOpenAI() {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [{ role: "user", content: "Halo, apakah koneksi OpenAI berhasil?" }],
        temperature: 0.3,
        max_tokens: 100,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ OpenAI Connected");
    console.log("Response:", response.data.choices[0].message.content.trim());
  } catch (error) {
    console.error("❌ Error connecting to OpenAI:", error.response?.data || error);
  }
}

(async () => {
  await testGoogleSheets();
  await testOpenAI();
})();
