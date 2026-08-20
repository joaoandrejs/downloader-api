const scdl = require('soundcloud-downloader').default;

class SoundCloudProvider {
    canHandle(url) {
        return url.includes('soundcloud.com/');
    }

    async getInfo(url) {
        const result = await scdl.getInfo(url);

        return {
            author: {
                name: result.user.username,
                id: result.user.id,
                description: result.user.description,
            },
            video: {
                url: result.permalink_url,
                title: result.title,
                description: null,
                thumbnail: result.artwork_url,
                lengthSeconds: result.duration,
                viewCount: result.playback_count,
            }
        };
    }

    async download(url, res) {
        const info = await scdl.getInfo(url);
        const title = info.title;

        // O scdl.download já retorna uma stream pronta para consumo[cite: 2]
        const stream = await scdl.download(url);
        
        const safeTitle = title.replace(/\n/gi, "").replace(/[^\x00-\x7F]+/gi, "");
        res.header('Content-Disposition', `attachment; filename="${safeTitle}.mp3"`);
        stream.pipe(res);
    }
}

module.exports = SoundCloudProvider;