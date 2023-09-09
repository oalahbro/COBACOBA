const { TiktokDL } = require("@tobyg74/tiktok-api-dl")
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const urlRegex = require("url-regex");
const fetch = require("node-fetch");
const https = require('https');
const fs = require('fs');
const { MessageMedia } = require('whatsapp-web.js');
const { url } = require("inspector");
 const tiktok_url = "https://www.tiktok.com/@salzabilll_/video/7275737700462775557"


// const getTiktokUrls = async (tiktok_url) => {
//     try {
//         const result = await TiktokDL(tiktok_url);
//         const urlnya = JSON.stringify(result);
//         const urls = urlnya.match(urlRegex());
        
//         if (!urls) {
//             // Handle the case where urls are not found (optional)
//             return [];
//         }

//         // Filter URLs that contain "v" and "CDN"
//         // const filteredUrls = urls.filter(url => url.includes("v") && url.includes("CDN"));
        

//         return urls[0];
//     } catch (error) {
//         // Handle any errors that occur during the TiktokDL request
//         console.error(error);
//         return [];
//     }
// };
// // Usage
// const tiktok_url = "https://www.tiktok.com/@salzabilll_/video/7275737700462775557";
// // const file = fs.createWriteStream(`aa.mp4`);
// const urlParts = tiktok_url.split("/");
// let id = urlParts[urlParts.length - 1];        
// if(id.includes("?")) id = id.split("?")[0];

// const file = fs.createWriteStream(`${id}.mp4`);
// getTiktokUrls(tiktok_url)
//     .then(urls => {
//         // console.log(urls)
//         const request = https.get(urls, function(response) {
//             response.pipe(file);
            
//           });
//     })
//     .catch(error => {
//         console.error(error);
//     });



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

      const filename = `${id}.mp4`;
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

module.exports = TiktokDownloader;
