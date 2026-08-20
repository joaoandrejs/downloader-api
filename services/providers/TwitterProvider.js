const { TwitterDL } = require("twitter-downloader");
const axios = require("axios");

class TwitterProvider {
    canHandle(url) {
        return url.includes('twitter.com/') || url.includes('x.com/');
    }

    async getInfo(url) {
        // Corrigido: no código original estava chamando 'TwitterDLs'[cite: 2]
        const { result } = await TwitterDL(url, {});
        
        if (!result) throw new Error("Não foi possível obter dados do Twitter");

        return {
            author: {
                name: result.author?.username,
                id: null,
                description: result.author?.bio,
            },
            video: {
                url: result.media[0]?.videos?.at(-1)?.url,
                title: null,
                description: result.description,
                thumbnail: result.media[0]?.cover,
                lengthSeconds: result.media[0]?.duration,
                viewCount: result.statistics?.viewCount,
            }
        };
    }

    async download(url, res) {
        const result = await TwitterDL(url, {});
        const videoLink = result.result?.media[0]?.videos?.at(-1)?.url;
        
        if (!videoLink) throw new Error("Vídeo não encontrado no tweet");

        const filename = result.result.description || "twitter_video";

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

module.exports = TwitterProvider;