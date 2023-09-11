
const fetch = require("node-fetch");
const fs = require('fs');
const { MessageMedia } = require('whatsapp-web.js');
const mime = require('mime-types');

 async function sticker(message,chat,stickerParts) {
    const author = stickerParts[0];
    const name = stickerParts[1];
      if(message.hasMedia){
        message.downloadMedia().then(media => {
            if (media) {
                const mediaPath = './tmp/';
                const extension = mime.extension(media.mimetype);
                const filename = new Date().getTime();
                const filename1 = mediaPath + filename + '.' + extension;
                try {
                    fs.writeFileSync(filename1, media.data, {encoding: 'base64'});
                    MessageMedia.fromFilePath(filePath = filename1)
                    chat.sendMessage(new MessageMedia(media.mimetype, media.data, filename), {sendMediaAsSticker: true,stickerAuthor:author,stickerName:name})
                     fs.unlinkSync(filename1)
                } catch (err) {
                    console.log(err);
                }
            }
        });
      }
}
module.exports = { sticker }
