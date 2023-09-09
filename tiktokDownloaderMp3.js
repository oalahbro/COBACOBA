const { TiktokDL } = require("@tobyg74/tiktok-api-dl")
const urlRegex = require("url-regex");
const fetch = require("node-fetch");
const https = require('https');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const { MessageMedia } = require('whatsapp-web.js');

class TiktokDownloader {
  constructor() {
    // You can initialize any class-level properties here
  }

  async getTiktokUrls(tiktok_url) {
    try {
      const result = await TiktokDL(tiktok_url);
      const urlnya = JSON.stringify(result);
      const urls = urlnya.match(urlRegex());

      if (!urls) {
        return [];
      }

      return urls[0];
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async downloadTiktokVideo(tiktok_url) {
    return new Promise(async (resolve, reject) => {
      const urlParts = tiktok_url.split("/");
      let id = urlParts[urlParts.length - 1];
      if (id.includes("?")) id = id.split("?")[0];

      const filename = `./tmp/${id}.mp4`;
      const file = fs.createWriteStream(filename);

      try {
        const urls = await this.getTiktokUrls(tiktok_url);
        if (!urls) {
          throw new Error("Video URL not found.");
        }

        const request = https.get(urls, function(response) {
          response.pipe(file);
          response.on('end', () => {
            resolve(filename); // Resolve the promise with the filename when done
          });
        });
        
        request.on('error', (error) => {
          console.error(error);
          reject(error); // Reject the promise if there's an error
        });
      } catch (error) {
        console.error(error);
        reject(error);
      }
    });
  }
}

async function dlsendmp3(message, tiktok_url) {
  try {
    const urlParts = tiktok_url.split("/");
    const tiktokDownloader = new TiktokDownloader();
    let id = urlParts[urlParts.length - 1];
    if (id.includes("?")) {
      id = id.split("?")[0];
    }
    const namefile =`./tmp/${id}.mp4`;
    await tiktokDownloader.downloadTiktokVideo(tiktok_url);

    const outputPath = `./tmp/${id}.mp3`;

    const command = ffmpeg();
    
    command.input(namefile);
    
    command.audioCodec('libmp3lame');
    
    command.output(outputPath);
    
    // Run the command and handle errors
    command.on('end', () => {
      console.log('Conversion finished.');
      const media = MessageMedia.fromFilePath(outputPath);
      message.reply(media);
      console.log('Downloaded and sent the TikTok MP3.');
      fs.unlinkSync(namefile)
    }).on('error', (err) => {
      console.error('Error:', err);
    }).run();
    
  } catch (error) {
    console.error('Error:', error);
    await message.reply(error);
  }
}
// module.exports = TiktokDownloader;
module.exports = { dlsendmp3 }