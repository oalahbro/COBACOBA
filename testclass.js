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

  //sticker
  client.on('message', async message => {
    let chat = await message.getChat();
    chat.sendSeen();

    if(message.body.startsWith('/sticker')){
      const commandParts = message.body.split(' ');
      if (commandParts.length === 1) {
        const defaultStickerText = "Oalah-BOT";
        const stickerParts = [defaultStickerText];
        await sticker(message, chat, stickerParts);
      }
      if (commandParts.length >= 2) {
        const stickerText = commandParts[1];
        const stickerParts = stickerText.split('|');
        await sticker(message,chat, stickerParts);
        }
      }
    })


    //tiktokdl
    client.on('message', async message => {
    
    let chat = await message.getChat();
    await chat.sendSeen();
  
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
  });


  //ttmp3
  client.on('message', async message => {
    let chat = await message.getChat();
    await chat.sendSeen();
  
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

  //ping
  client.on('message', async message => {
    let chat = await message.getChat();
    await chat.sendSeen();
  
    if (message.body.startsWith('/ping')) {
      const host = '8.8.8.8';
  
      // Wrap the ping operation in a Promise for asynchronous handling
      const pingPromise = new Promise((resolve) => {
        ping.sys.probe(host, (isAlive, response) => {
          if (isAlive) {
            const result = `alive (${response.time} ms)`;
            resolve(result);
          } else {
            const result = 'dead';
            resolve(result);
          }
        });
      });
  
      const pingResult = await pingPromise;
      await message.reply(`Ping result for ${host}: ${pingResult}`);
    }
  });
  