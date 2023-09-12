const { TiktokDL } = require("@tobyg74/tiktok-api-dl");
const urlRegex = require("url-regex");
const https = require('https');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const { MessageMedia } = require('whatsapp-web.js');

const generateRandomString = (myLength) => {
  const chars = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890";
  const randomArray = Array.from(
    { length: myLength },
    (v, k) => chars[Math.floor(Math.random() * chars.length)]
  );

  const randomString = randomArray.join("");
  return randomString;
};

class TiktokDownloader {
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
      try {
        const urls = await this.getTiktokUrls(tiktok_url);
        if (!urls) {
          throw new Error("Video URL not found.");
        }

        const id = generateRandomString(5);
        const filename = `./tmp/${id}.mp4`;
        const file = fs.createWriteStream(filename);

        const request = https.get(urls, function (response) {
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
    const tiktokDownloader = new TiktokDownloader();
    const namefile = `./tmp/${generateRandomString(5)}.mp4`;
    const videoFilename = await tiktokDownloader.downloadTiktokVideo(tiktok_url);

    const outputPath = `./tmp/${generateRandomString(5)}.mp3`;
    const command = ffmpeg();
    command.input(videoFilename);
    command.audioCodec('libmp3lame');
    command.output(outputPath);

    command.on('end', () => {
      console.log('Conversion finished.');
      const media = MessageMedia.fromFilePath(outputPath);
      message.reply(media);
      console.log('Downloaded and sent the TikTok MP3.');
      fs.unlinkSync(videoFilename);
      fs.unlinkSync(outputPath);
    }).on('error', (err) => {
      console.error('Error:', err);
    }).run();
  } catch (error) {
    console.error('Error:', error);
    await message.reply(error.message);
  }
}

module.exports = { dlsendmp3 };
