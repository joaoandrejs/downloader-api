const { instagramDownload } = require("@mrnima/instagram-downloader");
const axios = require("axios");

class InstagramProvider {
    canHandle(url) {
        return url.includes('instagram.com/');
    }

    async getInfo(url) {
        // Corrigido: no código original estava chamando 'instagramDl' que não existia
        const dataList = await instagramDownload(url);
        
        if (!dataList || !dataList[0]) {
            throw new Error("Vídeo do Instagram não encontrado");
        }
        
        return {
            author: {
                name: null, // A lib do mrnima não retorna o autor facilmente nesse formato
                id: null,
                description: null,
            },
            video: {
                url: dataList[0].download_link || null,
                title: dataList[0].title || null,
                description: dataList[0].description || null,
                thumbnail: dataList[0].thumbnail_link || null,
                lengthSeconds: null,
                viewCount: null,
            }
        };
    }

    async download(url, res) {
        const dataList = await instagramDownload(url);

        console.log("[DEBUG] Retorno do Instagram:", JSON.stringify(dataList, null, 2));
        
        if (!dataList || !dataList[0] || !dataList[0].download_link) {
            throw new Error("Link de download não encontrado no Instagram");
        }

        const videoLink = dataList[0].download_link;
        const filename = dataList[0].title || "instagram_video";

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

module.exports = InstagramProvider;