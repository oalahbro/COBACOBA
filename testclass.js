const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { MessageMedia } = require('whatsapp-web.js');
const { dlsend } = require('./tiktokDownloader');
const { dlsendmp3 } = require('./tiktokDownloaderMp3');
const { sticker } = require('./sticker');

const prefix = '/';
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true, executablePath: '/opt/google/chrome/google-chrome' }
});

client.initialize();
client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
});
client.on('authenticated', () => {
  console.log('AUTHENTICATED');
});
client.on('auth_failure', msg => {
  console.error('AUTHENTICATION FAILURE', msg);
});
client.on('ready', () => {
  console.log('Client is ready!');
});

client.on('message', async message => {
  let chat = await message.getChat();
  chat.sendSeen();

  if (message.body.startsWith('/sticker') || message.body.startsWith('/s')) {
    const commandParts = message.body.split(' ');
    if (commandParts.length === 1) {
      const defaultStickerText = "Oalah-BOT";
      const stickerParts = [defaultStickerText];
      await sticker(message, chat, stickerParts);
    }
    if (commandParts.length >= 2) {
      const stickerText = commandParts[1];
      const stickerParts = stickerText.split('|');
      await sticker(message, chat, stickerParts);
    }
  }

  if (message.body.startsWith('/tt')) {
    const parts = message.body.split(' ');
    const urlRegex = /(https?:\/\/[^\s]+)/;
    let tiktok_url = null;

    for (const part of parts) {
      if (urlRegex.test(part)) {
        tiktok_url = part;
        break; // Stop when the first URL is found
      }
    }
    if (tiktok_url) {
      await dlsend(message, tiktok_url);
    }
  }

  if (message.body.startsWith('/mp3tt')) {
    const parts = message.body.split(' ');
    const urlRegex = /(https?:\/\/[^\s]+)/;
    let tiktok_url = null;

    for (const part of parts) {
      if (urlRegex.test(part)) {
        tiktok_url = part;
        break; // Stop when the first URL is found
      }
    }
    if (tiktok_url) {
      await dlsendmp3(message, tiktok_url);
    }
  }
});

//module.exports = { client };
