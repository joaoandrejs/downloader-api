const express = require('express');
const axios = require('axios');
const app = express();
const ytdl = require('ytdl-core');
const scdl = require('soundcloud-downloader').default;
const Tiktok = require("@tobyg74/tiktok-api-dl");
const { TwitterDL } = require("twitter-downloader");
const instagramDl = require("@sasmeee/igdl");

app.get('/api/get-info', async (req, res) => {
  try {
    const videoURL = req.query.url;
    const { url, title, description, thumbnail } = await getInfo(videoURL, res);
    
    return res.json({ url, title, description, thumbnail});
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});


app.get('/api/download', async (req, res) => {

  try {
    const url = req.query.url;
  
    if (!url) {
        res.status(400).send('URL não informada');
        return;
    }
    
    await MediaDownloader(url, res);
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`[SERVER] Rodando na porta: ${PORT}`);
});

async function getInfo(url, res) {
  if (!url || !url.includes("http")) {
    res.status(400).json({ error: "Please specify a video URL." });
  }

  url = extractUrlFromString(url);

  try {
    if (url.includes("instagram.com/") || url.includes("instagram.com/")) {
      try {
        const dataList = await instagramDl(url);
        if (!dataList || !dataList[0]) {
          res.status(400).json({ error: "[INSTAGRAM] Invalid video URL..." });
        }
        
        return { url: dataList[0].download_link, title: dataList[0].title, description: dataList[0].description, thumbnail: dataList[0].thumbnail_link }
      } catch (error) {
        res.status(400).json({ error: "[INSTAGRAM] Error get infos from Instagram video:\n " + error.message });
      }
  
    }
    else if (url.includes('tiktok.com/')) {
      try {
        const result = await Tiktok.Downloader(url, {
          version: "v2" //version: "v1" | "v2" | "v3"
        });
        
        return { url: result.result.video, title: result.result.author.nickname, description: result.result.desc, thumbnail: result.result.author.avatar }
      } catch (error) {
        throw new Error("[TIKTOK] Error get infos from TikTok video:\n " + error.message);
      }
  
    }
    else 
    if (url.includes("youtu.be/") || url.includes("youtube.com/")) {
      try {
        
        const result = await ytdl.getInfo(url);
        
        return { url: result.videoDetails.video_url, title: result.videoDetails.title, description: result.videoDetails.description, thumbnail: result.videoDetails.thumbnails[result.videoDetails.thumbnails.length - 1].url }
      } catch (error) {
        res.status(400).json({ error: "[YOUTUBE] Error get infos from YouTube video:\n " + error.message });
      }
  
    }
    else
    if (url.includes("twitter.com") || url.includes("x.com/")) {

      try {
        const {result} = await TwitterDL(url, {});
        
        return { url: result.media[0].videos[result.media[0].videos.length - 1].url, title: result.author.username, description: result.description, thumbnail: result.media[0].cover }
      } catch (error) {
        res.status(400).json({ error: "[TWITTER] Error downloading Twitter video:\n " + error.message });
      }
    }
    else
    if (url.includes("soundcloud.com/")) {
      try {
        const result = await scdl.getInfo(url);

        return { url: result.permalink_url, title: result.user.username, description: result.title, thumbnail: result.artwork_url };

      } catch (error) {
        res.status(400).json({ error: "[SOUNDCLOUD] Error downloading SoundCloud audio:\n " + error.message });
      }
    }
    else {
      res.status(400).json({ error: "Please specify a URL. [Youtube, SoundCloud, Instagram, TikTok or Twitter]" });
    }

  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
}

const MediaDownloader = async (url, res) => {
    if (!url || !url.includes("http")) {
      res.status(400).json({ error: "Please specify a video URL." });
    }

    url = extractUrlFromString(url);

    if (url.includes("instagram.com/") || url.includes("instagram.com/")) {
      try {
        const dataList = await instagramDl(url);
        if (!dataList || !dataList[0]) {
          res.status(400).json({ error: "[INSTAGRAM] Invalid video URL..." });
        }

        const videoURL = dataList[0].download_link;
        await downloadDirectVideo(videoURL, res);

        return;
      } catch (error) {
        res.status(400).json({ error: "[INSTAGRAM] Error downloading or sending Instagram video:\n " + error.message });
      }
  
    } 
    else if (url.includes('tiktok.com/')) {
      try {
        const result = await Tiktok.Downloader(url, {
          version: "v2" //  version: "v1" | "v2" | "v3"
        });

        const videoLink = result.result.video;
        await downloadDirectVideo(videoLink, res);
      } catch (error) {
        res.status(400).json({ error: "[TIKTOK] Error downloading TikTok video:\n " + error.message });
      }
  
    } 
    else 
    if (url.includes("youtu.be/") || url.includes("youtube.com/")) {
      try {
        await downloadYoutubeVideo(url, res);
      } catch (error) {
        res.status(400).json({ error: "[YOUTUBE] Error downloading YouTube video:\n " + error.message });
      }
  
    }
    else
    if (url.includes("twitter.com") || url.includes("x.com/")) {
      try {
        const result = await TwitterDL(url, {
        });
        
        const videoLink = result.result.media[0].videos[result.result.media[0].videos.length - 1].url;
        await downloadDirectVideo(videoLink, res, result.result.description);
      } catch (error) {
        res.status(400).json({ error: "[TWITTER] Error downloading Twitter video:\n " + error.message });
      }
    }
    else
    if (url.includes("soundcloud.com/")) {
      try {
        await downloadSouncloudAudio(url, res);
      } catch (error) {
        res.status(400).json({ error: "[SOUNDCLOUD] Error downloading SoundCloud audio:\n " + error.message });
      }
    }
    else {
      res.status(400).json({ error: "Please specify a URL. [Youtube, SoundCloud, Instagram, TikTok or Twitter]" });
    }

    return;
};

function extractUrlFromString(text) {

    // Using a regular expression to find the URL
    const urlRegex = /(https?:\/\/[^\s]+)/;

    const match = text.match(urlRegex);

    if (match) {
        return match[0]; // Returns the first URL found in the text
    } else {
        return null; // Returns null if no URL is found
    }

};

async function downloadDirectVideo(url, res, filename) {
  try {
    
    const response = await axios({
      url: url,
      method: 'GET',
      responseType: 'stream'
    });
    
    const contentType = response.headers['content-type'];
    
    const URL = {
      url: response.url
    };

    res.header('Content-Disposition', `attachment; filename="${filename}.mp4"`).status(200).json(URL)
    response.data.pipe(res);

  } catch (error) {
    res.status(400).json({ error: `Generic Downloader API Error: ${error.message}` });
  }
}

async function downloadYoutubeVideo(videoUrl, res) {
  try {
    if (!ytdl.validateURL(videoUrl)) {
        throw new Error('URL do YouTube inválido');
    }
    
    const info = await ytdl.getInfo(videoUrl);
    const title = info.videoDetails.title;
    
    let attachment = res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
    ytdl(videoUrl, { format: 'mp4' }).pipe(res);
    
    return attachment;
  } catch (error) {
    res.status(400).json({ error: `YouTube Downloader API Error: ${error.message}` });
  }
}

async function downloadSouncloudAudio(trackUrl, res) {
  try {
    const info = await scdl.getInfo(trackUrl);
    const title = info.title;
    const stream = await scdl.download(trackUrl);

    res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
    stream.pipe(res);
  } catch (error) {
    res.status(400).json({ error: `SoundCloud Dwonloader API Error: ${error.message}` });
  }
}
