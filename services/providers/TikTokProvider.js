const TikTok = require("@tobyg74/tiktok-api-dl");
const axios = require("axios");

class TikTokProvider {
    canHandle(url) {
        return url.includes('tiktok.com/');
    }

    async getInfo(url) {
        const result = await TikTok.Downloader(url, {
            version: "v2"
        });
        
        return {
            author: {
                name: result.result.author.nickname,
                id: null,
                description: null,
            },
            video: {
                url: result.result.video,
                title: null,
                description: result.result.desc,
                thumbnail: null,
                lengthSeconds: null,
                viewCount: null,
            }
        };
    }

    async download(url, res) {
        const result = await TikTok.Downloader(url, {
            version: "v2"
        });
        
        const videoLink = result.result.video;
        const filename = result.result.desc || "tiktok_video";
        
        // Faz o stream do vídeo (adaptado da sua função Downloader)
        const response = await axios({
          url: videoLink,
          method: 'GET',
          responseType: 'stream'
        });
        
        const safeFilename = filename.replace(/\n/gi, "").replace(/[^\x00-\x7F]+/gi, "");
        res.header('Content-Disposition', `attachment; filename="${safeFilename}.mp4"`); 
        response.data.pipe(res);
    }
}

module.exports = TikTokProvider;