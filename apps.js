const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const bodyParser = require('body-parser');
const express = require('express')
const app = express()
const port = 3000
const { MessageMedia } = require('whatsapp-web.js');
const fetch = require('node-fetch');
const mime = require('mime-types');


app.use(bodyParser.urlencoded({ extended: false }));

const generateRandomString = (myLength) => {
    const chars =
        "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890";
    const randomArray = Array.from(
        { length: myLength },
        (v, k) => chars[Math.floor(Math.random() * chars.length)]
    );

    const randomString = randomArray.join("");
    return randomString;
};
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true },

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

app.post('/kirim', async (req, res) => {

    let pesan = req.body.pesan
    let nomer = req.body.nomer
    let nama = generateRandomString(10)
    let url = req.body.link

    var phoneno = /^(62)8[1-9][0-9]{6,10}$/;
    if (nomer.match(phoneno)) {
        const response = await fetch(url);
        const buffer = await response.buffer();
        fs.writeFile('./image/' + nama + '.jpg', buffer, () => {
            let media = MessageMedia.fromFilePath('./image/' + nama + '.jpg')
            client.sendMessage(nomer + "@c.us", media, { caption: pesan })
            console.log('finished downloading!')

            try {
                fs.unlinkSync('./image/' + nama + '.jpg')
                //file removed
            } catch (err) {
                console.error(err)
            }
        });
        // res.send(req.body)
        res.json({ status: 'sukses' })
        console.log('sukses')
    }
    else {
        console.log('gagal')
        res.send('gagal')
    }




    // const media = await MessageMedia.fromUrl('https://www.iasgurukul.com/images/abhinav.png',);


    console.log(nomer + "@c.us")
    console.log(pesan)
    console.log(url)
})

app.post('/kirimpdf', async (req, res) => {

    let pesan = req.body.pesan
    let nomer = req.body.nomer
    let nama = generateRandomString(10)
    let url = req.body.link

    var phoneno = /^(62)8[1-9][0-9]{6,10}$/;
    if (nomer.match(phoneno)) {
        const response = await fetch(url);
        const buffer = await response.buffer();
        fs.writeFile('./pdf/' + nama + '.pdf', buffer, () => {
            let media = MessageMedia.fromFilePath('./pdf/' + nama + '.pdf')
            client.sendMessage(nomer + "@c.us", media, { caption: pesan })
            console.log('finished downloading!')

            try {
                fs.unlinkSync('./pdf/' + nama + '.pdf')
            } catch (err) {
                console.error(err)
            }
        });
        // res.send(req.body)
        res.json({ status: 'sukses' })
        console.log('sukses')
    }
    else {
        console.log('gagal')
        res.send('gagal')
    }

    console.log(nomer + "@c.us")
    console.log(pesan)
    console.log(url)
})

client.on('message', async message => {
    let chat = await message.getChat();
    chat.sendSeen();
    
    if(message.body === '/sticker'){
            if(message.hasMedia){
                message.downloadMedia().then(media => {
                    if (media) {
                        const mediaPath = './mediaPath/';
                        if (!fs.existsSync(mediaPath)) {
                            fs.mkdirSync(mediaPath);
                        }
                        const extension = mime.extension(media.mimetype);
                        const filename = new Date().getTime();
                        const filename1 = mediaPath + filename + '.' + extension;
                        try {
                            fs.writeFileSync(filename1, media.data, {encoding: 'base64'});
                            MessageMedia.fromFilePath(filePath = filename1)
                            client.sendMessage(message.from, new MessageMedia(media.mimetype, media.data, filename), {sendMediaAsSticker: true,stickerAuthor:"BotWA",stickerName:"Sticker"})
                            fs.unlinkSync(filename1)
                        } catch (err) {
                            console.log(err);
                        }
                    }
                });
            }
        }
    })

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
client.on('message', msg => {
        if(msg.body.includes('/ping')){
            let string = msg.body.split(" ");
            msg.reply(string);
    }
});

