const ytdl = require('ytdl-core');
const scdl = require('soundcloud-downloader').default;
const { TwitterDL } = require("twitter-downloader");
const TikTok = require("@tobyg74/tiktok-api-dl");
const instagramDl = require("@sasmeee/igdl");

module.exports = {
    
    extractUrlFromString: function(text) {
        const urlRegex = /(https?:\/\/[^\s]+)/;
        const match = text.match(urlRegex);
    
        return match ? match[0] : null;
    },
    
    downloadFromYouTube: async function(videoUrl, res) {
        try {
            const ytdl = require('ytdl-core');
            if (!ytdl.validateURL(videoUrl)) {
                return res.status(400).json({ message: 'Video not found' });
            }

            const info = await ytdl.getInfo(videoUrl);
            const title = info.videoDetails.title;
            
            ytdl(videoUrl, { format: 'mp4' }).pipe(res);
            return await res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
        } catch (error) {
            console.error(error.stack);
            return res.status(400).json({ message: `YouTube Downloader API Error:`, error: error.message});
        }
    },

    downloadFromTwitter: async function(videoUrl, res) {
        try {
            const result = await TwitterDL(videoUrl, {});
            
            const videoLink = result.result.media[0].videos[result.result.media[0].videos.length - 1].url;
            return await Downloader(videoLink, res, result.result.description);
        } catch (error) {
            console.error(error.stack);
            return res.status(400).json({ message: "[TWITTER] Error downloading Twitter video", error: error.message }); 
        }
    },

    downloadFromTikTok: async function(videoUrl, res) {
        try {
            const result = await TikTok.Downloader(videoUrl, {
                version: "v2" //  version: "v1" | "v2" | "v3"
            });
            
            const videoLink = result.result.video;
            await Downloader(videoLink, res, result.result.desc);
        } catch (error) {
            console.error(error.stack);
            return res.status(400).json({ message: "[TIKTOK] Error downloading TikTok video", error: error.message });
        }
    },

    downloadFromInstagram: async function(videoUrl, res) {
        try {
            const dataList = await instagramDl(videoUrl);
            if (!dataList || !dataList[0]) {
                res.status(400).json({ error: "[INSTAGRAM] Invalid video URL..." });
            }
            
            const videoURL = dataList[0].download_link;
            await Downloader(videoURL, res, 'REELS - Downloaded with Downloader API');
        } catch (error) {
            console.error(error.stack);
            return res.status(400).json({ message: "[INSTAGRAM] Error downloading Instagram video", error: error.message });
        }
    },

    downloadFromSoundCloud: async function(videoUrl, res) {
        try {
            const info = await scdl.getInfo(videoUrl);
            const stream = await scdl.download(videoUrl);
            const title = info.title;

            res.header('Content-Disposition', `attachment; filename="${(title).replace(/\n/gi, "").replace(/[^\x00-\x7F]+/gi, "")}.mp3"`);
            return stream.pipe(res);
        } catch (error) {
            console.error(error.stack);
            return res.status(400).json({ message: "[SOUNDCLOUD] Error downloading SoundCloud audio", error: error.message });
        }

    },

    getInformation: async function(url, res) {
        try {
            
            if (url.includes("instagram.com/")) {
                try {
                    const dataList = await instagramDl(url);
                    if (!dataList || !dataList[0]) {
                        res.status(400).json({ error: VideoNotFoundError });
                    }
                    
                    const response = {
                        author: {
                            name: null,
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
                    }
                    
                    return res.status(200).json(response);
                } catch (error) {
                    console.error(error.stack);
                    res.status(400).json({ message: "[INSTAGRAM] Error get infos from Instagram", error: error.message });
                }
            }
            else if (url.includes('tiktok.com/')) {
                try {
                    const result = await TikTok.Downloader(url, {
                        version: "v2" //version: "v1" | "v2"
                    });
                    
                    const response = {
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
                    }
                    
                    return res.status(200).json(response);
                } catch (error) {
                    console.error(error.stack);
                    return res.status(400).json({ message: "[TIKTOK] Error get infos from TikTok", error: error.message });
                }
        
            }
            else 
            if (url.includes("youtu.be/") || url.includes("youtube.com/")) {
                try {
                    const result = await ytdl.getInfo(url);
                    
                    const response = {
                        author: {
                            name: result.videoDetails.author.name,
                            id: result.videoDetails.author.id,
                            description: null,
                        },
                        video: {
                            url: result.videoDetails.video_url,
                            title: result.videoDetails.title,
                            description: result.videoDetails.description,
                            thumbnail: result.videoDetails.thumbnails[result.videoDetails.thumbnails.length - 1].url,
                            lengthSeconds: result.videoDetails.lengthSeconds,
                            viewCount: result.videoDetails.viewCount,
                        }
                    }
                    
                    return res.status(200).json(response);
                } catch (error) {
                    console.error(error.stack);
                    return res.status(400).json({ message: "[YOUTUBE] Error get infos from YouTube", error: error.message });
                }
            }
            else
            if (url.includes("twitter.com") || url.includes("x.com/")) {
                try {
                    const {result} = await TwitterDLs(url, {});
                    
                    const response = {
                        author: {
                            name: result.author.username,
                            id: null,
                            description: result.author.bio,
                        },
                        video: {
                            url: result.media[0].videos[result.media[0].videos.length - 1].url,
                            title: null,
                            description: result.description,
                            thumbnail: result.media[0].cover,
                            lengthSeconds: result.media[0].duration,
                            viewCount: result.statistics.viewCount,
                        }
                    }
                    
                    return res.status(200).json(response);
                } catch (error) {
                    console.error(error.stack);
                    res.status(400).json({ message: "[TWITTER] Error get infos from Twitter", error: error.message });
                }
            }
            else
            if (url.includes("soundcloud.com/")) {
                try {
                    const result = await scdl.getInfo(url);

                    const response = {
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
                    }

                    return res.status(200).json(response);
            
                } catch (error) {
                    console.error(error.stack);
                    res.status(400).json({ message: "[SOUNDCLOUD] Error get infos from SoundCloud", error: error.message }); 
                }
            }
            else {
                res.status(400).json({ error: "Please specify a URL. [YouTube, Instagram, TikTok, Twitter or SoundCloud audio]" });
            }
        } catch (error) {
            console.error(error.stack);
            return res.status(400).json({ message: "", error: error.message });
        }
    }

}

async function Downloader(url, res, filename) {
    try {
        const axios = require('axios');
        
        const response = await axios({
          url: url,
          method: 'GET',
          responseType: 'stream'
        });
        
        response.data.pipe(res);
        return res.header('Content-Disposition', `attachment; filename="${(filename).replace(/\n/gi, "").replace(/[^\x00-\x7F]+/gi, "")}.mp4"`); 
      } catch (error) {
        console.error(error.stack);
        return res.status(400).json({ message: `Downloader API Error`, error: error.message });
      }
}