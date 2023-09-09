const TiktokDownloader = require('./tiktokDownloader'); // Adjust the path to the actual location of tiktokDownloader.js

const tiktokDownloader = new TiktokDownloader();
const tiktok_url = "https://www.tiktok.com/@salzabilll_/video/7275737700462775557";
tiktokDownloader.downloadTiktokVideo(tiktok_url);