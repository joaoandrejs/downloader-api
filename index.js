const express = require('express');
const app = express();

const {
    extractUrlFromString,
    downloadFromYouTube,
    downloadFromTwitter,
    downloadFromTikTok,
    downloadFromInstagram,
    downloadFromSoundCloud,
    getInformation,
} = require('./utils/functions');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`[SERVER] Rodando na porta: ${PORT}`);
});

app.get('/', (req, res) => {
    res.status(200).send('App is running\n\nSee API on: /api/get-info | /api/download');
});

app.get('/api/', (req, res) => {
    res.status(200).json({ message: 'API is running', status: 'OK', version: '1.0.0', author: 'joaoandrejs', url: 'https://github.com/joaoandrejs/downloader-api' });
});

app.get('/api/download', async (req, res) => {
    try {
        const url = extractUrlFromString(req.query.url);
        if (!url) {
            res.status(400).json({ error: 'URL not specified' });
            return;
        }

        if (url.includes('youtu.be/') || url.includes('youtube.com/')) {
            try {
                return await downloadFromYouTube(url, res);
            } catch (error) {
                return res.status(400).json({ message: "[YOUTUBE] Error downloading YouTube video", error: error.message });
            }
        } else
        if (url.includes('x.com/') || url.includes('twitter.com/')) {
            try {
                return await downloadFromTwitter(url, res);
            } catch (error) {
                return res.status(400).json({ message: "[TWITTER] Error downloading Twitter video", error: error.message });
            }
        }
        else
        if (url.includes('tiktok.com/')) {
            try {
                return await downloadFromTikTok(url, res);
            } catch (error) {
                return res.status(400).json({ message: "[TIKTOK] Error downloading TikTok video", error: error.message }); 
            }
        }
        else
        if (url.includes('instagram.com/')) {
            try {
                return await downloadFromInstagram(url, res);
            } catch (error) {
                return res.status(400).json({ message: "[INSTAGRAM] Error downloading Instagram video", error: error.message }); 
            }
        }
        if (url.includes('soundcloud.com/')) {
            try {
                return await downloadFromSoundCloud(url, res);
            } catch (error) {
                return res.status(400).json({ message: "[SOUNDCLOUD] Error downloading SoundCloud audio", error: error.message }); 
            }
        }
        else {
            return res.status(400).json({ message: "Please specify a URL. [YouTube, Instagram, TikTok, Twitter or SoundCloud audio]" });
        }

    } catch (error) {
        return res.status(500).json({ message: error.message, error: error });
    }

});

app.get('/api/getinfo', async (req, res) => {
    const url = await extractUrlFromString(req.query.url);
    if (!url || !url.includes("http")) {
        return res.status(400).json({ error: "Please specify a video URL." });
    }
    
    try {
        
        await getInformation(url, res);
    
      } catch (error) {
        console.error(error.stack);
        res.status(400).json({ message: "Error getting information", error: error.message });
      }
})
