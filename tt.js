const { TiktokDL } = require("@tobyg74/tiktok-api-dl")
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const urlRegex = require("url-regex");
const fetch = require("node-fetch");
const https = require('https');
const fs = require('fs');
const { MessageMedia } = require('whatsapp-web.js');
const tiktok_url = "https://www.tiktok.com/@salzabilll_/video/7275737700462775557"





const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true, executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe' },

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

var foo =  (msg) => {
    // do something
   var bar =  TiktokDL(tiktok_url).then((result) => {
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
            namefile = id.slice(0, -8) + '.mp4'
            fs.rename(`${id}.mp4`, namefile, function(err) {
                if ( err ) console.log('ERROR: ' + err);
            });
            try {
                let media = MessageMedia.fromFilePath('./' + namefile)
                msg.reply(media);
            } catch (error) {
                console.log("yah gagal")
            }
        }
    })
  }

client.on('message', msg => {
    if (msg.body == '/ping') {
        foo(msg)
        // console.log(foo())
        //client.sendMessage(nomer + "@c.us", media)
    }
});