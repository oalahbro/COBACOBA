const { TiktokDL } = require("@tobyg74/tiktok-api-dl")
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const urlRegex = require("url-regex");
const fetch = require("node-fetch");
const https = require('https');
const fs = require('fs');
const { MessageMedia } = require('whatsapp-web.js');
const { url } = require("inspector");
const TiktokDownloader = require('./tiktokDownloader'); 
// Adjust the path to the actual location of tiktokDownloader.js
const tiktokDownloader = new TiktokDownloader();
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: false, executablePath: '/opt/google/chrome/google-chrome' },
  
  });
  client.initialize();
  client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
  }); ``
  client.on('authenticated', () => {
    console.log('AUTHENTICATED');
  });
  client.on('auth_failure', msg => {
    console.error('AUTHENTICATION FAILURE', msg);
  });
  
  client.on('ready', () => {
  
    console.log('Client is ready!');
  });




  async function dlsend(message) {
    try {
      const tiktok_url = "https://www.tiktok.com/@salzabilll_/video/7275737700462775557";
      const urlParts = tiktok_url.split("/");
      let id = urlParts[urlParts.length - 1];
  
      if (id.includes("?")) {
        id = id.split("?")[0];
      }
  
      const namefile = id + '.mp4';
  
      // Download the TikTok video
      await tiktokDownloader.downloadTiktokVideo(tiktok_url);
     // await new Promise(resolve => setTimeout(resolve, 5000));
  
      // Create a MessageMedia object from the downloaded video
      const media = MessageMedia.fromFilePath('./' + namefile);
  
      // Reply with the downloaded video
      await message.reply(media);
  
      console.log('Downloaded and sent the TikTok video.');
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  client.on('message', async message => {
    let chat = await message.getChat();
    await chat.sendSeen();
  
    if (message.body === '/tt') {
      await dlsend(message);
    }
  });
  
  
  
  
  
  