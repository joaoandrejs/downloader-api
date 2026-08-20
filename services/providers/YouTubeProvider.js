const ytdl = require('ytdl-core');

class YouTubeProvider {
    canHandle(url) {
        return url.includes('youtu.be/') || url.includes('youtube.com/');
    }

    async getInfo(url) {
        const result = await ytdl.getInfo(url);
        return {
            author: {
                name: result.videoDetails.author.name,
                id: result.videoDetails.author.id,
            },
            video: {
                url: result.videoDetails.video_url,
                title: result.videoDetails.title,
                thumbnail: result.videoDetails.thumbnails.at(-1).url,
            }
        };
    }

    async download(url, res) {
        if (!ytdl.validateURL(url)) throw new Error('Video not found');
        const info = await ytdl.getInfo(url);
        const title = info.videoDetails.title;
        
        res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
        ytdl(url, { format: 'mp4' }).pipe(res);
    }
}

module.exports = YouTubeProvider;