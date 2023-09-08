const { TiktokDL } = require("@tobyg74/tiktok-api-dl")
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const urlRegex = require("url-regex");
const fetch = require("node-fetch");
const https = require('https');
const fs = require('fs');
const { MessageMedia } = require('whatsapp-web.js');
const tiktok_url = "https://www.tiktok.com/@b13226648j4/video/7273536223866572065"
let bro = 0

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: false, executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe' },

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
   var bar =  TiktokDL(tiktok_url).then((result) => {
        urlnya = JSON.stringify(result)
        const urls = urlnya.match(urlRegex());
        // const link = urls.at(0)
        // console.log(urls)
        if (!urls) {
            foo()
        } else {
            const link = urls[0]
            let url = tiktok_url;
            if (url.endsWith('/')) url = url.substring(0, url.length - 1);
            const urlParts = url.split("/");
            let id = urlParts[urlParts.length - 1];        
            if(id.includes("?")) id = id.split("?")[0];

            const file = fs.createWriteStream(`${id}.mp4`);
            https.get(link, function(response) {
              response.pipe(file);
            });
            bro = id;
            // console.log(id)
        }

    })
  }

client.on('message', async msg => {
    if (msg.body == '/lop') {
        await foo()
        await new Promise(resolve => setTimeout(resolve, 5000));
        if (bro == 0) {
           await foo()
        } else {
            if (fs.existsSync(bro+'.mp4')) {
                console.log('ada')
                let media = MessageMedia.fromFilePath(bro+'.mp4')
                console.log(bro+'okeeeee')
                msg.reply(media);
              }else{
                console.log("ga ada")
                foo()
              }
        }
        
    }
});
