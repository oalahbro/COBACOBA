const { TiktokDL } = require("@tobyg74/tiktok-api-dl")
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const urlRegex = require("url-regex");
const fetch = require("node-fetch");
const https = require('https');
const fs = require('fs');
const { MessageMedia } = require('whatsapp-web.js');
const tiktok_url = "https://www.tiktok.com/@ugm.id/video/7273380937675640069"





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

var foo = async () => {
    // do something
   var bar = await TiktokDL(tiktok_url).then((result) => {
        urlnya = JSON.stringify(result)
        const urls = urlnya.match(urlRegex());
        // const link = urls.at(0)
        // console.log(urls)
        if (!urls) {
            foo()
        } else {
            const link = urls[0]
            // console.log(link)
            let url = tiktok_url;
            if (url.endsWith('/')) url = url.substring(0, url.length - 1);
            const urlParts = url.split("/");
            let id = urlParts[urlParts.length - 1];        
            if(id.includes("?")) id = id.split("?")[0];

            const file = fs.createWriteStream(`${id}.mp4`);
            const request = https.get(link, function(response) {
              response.pipe(file);
            });
            // const media = MessageMedia.fromUrl(link);
            let media = MessageMedia.fromFilePath(`./${id}.mp4`)
            client.sendMessage("6281927442421@c.us", media)
            msg.reply(media);
        }

    })
  }

client.on('message', msg => {
    if (msg.body == '/lop') {
        foo()
        if (bro == 0) {
            foo()
            let media = MessageMedia.fromFilePath(bro+'.mp4')
            console.log(bro+'okeeeee')
            msg.reply(media);
        } else {
            let media = MessageMedia.fromFilePath(bro+'.mp4')
            console.log(bro+'okeeeee')
            msg.reply(media);
        }
        
        
    }
});
