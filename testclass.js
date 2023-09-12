const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { dlsend } = require('./tiktokDownloader');
const { dlsendmp3 } = require('./tiktokDownloaderMp3');
const { sticker } = require('./sticker');

const prefix = '/';
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true, executablePath: '/usr/bin/google-chrome' }
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

client.on('message', async (message) => {
  let chat = await message.getChat();
  chat.sendSeen();

  const commandParts = message.body.split(' ');
  const command = commandParts[0].toLowerCase();

  switch (command) {
    case '/sticker':
    case '/s':
      handleSticker(message, chat, commandParts);
      break;

    case '/tt':
      handleTikTok(message, chat, commandParts);
      break;

    case '/mp3tt':
      handleTikTokMP3(message, chat, commandParts);
      break;
  }
});

async function handleSticker(message, chat, commandParts) {
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

async function handleTikTok(message, chat, commandParts) {
  const urlRegex = /(https?:\/\/[^\s]+)/;
  let tiktok_url = null;

  for (const part of commandParts) {
    if (urlRegex.test(part)) {
      tiktok_url = part;
      break;
    }
  }
  if (tiktok_url) {
    await dlsend(message, tiktok_url);
  }
}

async function handleTikTokMP3(message, chat, commandParts) {
  const urlRegex = /(https?:\/\/[^\s]+)/;
  let tiktok_url = null;

  for (const part of commandParts) {
    if (urlRegex.test(part)) {
      tiktok_url = part;
      break;
    }
  }
  if (tiktok_url) {
    await dlsendmp3(message, tiktok_url);
  }
}
