const { TiktokDL } = require("@tobyg74/tiktok-api-dl")
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const urlRegex = require("url-regex");
const fetch = require("node-fetch");
const https = require('https');
const fs = require('fs');
const { MessageMedia } = require('whatsapp-web.js');
const { url } = require("inspector");
const { dlsend } = require('./tiktokDownloader'); 


const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: false,executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe' }
  
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

  client.on('message', async message => {
    let chat = await message.getChat();
    await chat.sendSeen();
  
    if (message.body.includes('/tt')) {
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
  });