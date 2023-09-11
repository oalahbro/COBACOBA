const { TiktokDL } = require("@tobyg74/tiktok-api-dl")
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const urlRegex = require("url-regex");
const fetch = require("node-fetch");
const https = require('https');
const fs = require('fs');
const mime = require('mime-types');
const { MessageMedia } = require('whatsapp-web.js');
const { url } = require("inspector");
const { dlsend } = require('./tiktokDownloader'); 
const { dlsendmp3 } = require('./tiktokDownloaderMp3'); 
const { sticker } = require('./sticker'); 
const ping = require('ping');


const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true,executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe' }
  
  });

  client.initialize();
  client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
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

  const mediaPath = './tmp/';
  if (!fs.existsSync(mediaPath)) {
      fs.mkdirSync(mediaPath);
  }

  client.on('message', async (message) => {
    let chat = await message.getChat();
    chat.sendSeen();
  
    const command = message.body.split(' ')[0];
  
    switch (command) {
      case '/sticker':
      case '/Sticker':
      case '/s':
        const stickerParts = message.body.split('|');
        await sticker(message, chat, stickerParts);
        break;
  
      case '/tt':
        await handleTikTokCommand(message, chat, true);
        break;
  
      case '/mp3tt':
        await handleTikTokCommand(message, chat, false);
        break;
    }
  });
  
  async function handleTikTokCommand(message, chat, isVideo) {
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
      if (isVideo) {
        await dlsend(message, tiktok_url);
      } else {
        await dlsendmp3(message, tiktok_url);
      }
    }
  }