//https://soundcloud.com/arthur-nunes-321417046/derxan-musica-pra-fumar-balao?si=557c8ef327454eb6901003bec381014d&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing
//https://www.youtube.com/watch?v=dLRA1lffWBw
//https://x.com/marinz1nha/status/1806090138771984449

const express = require('express');
const axios = require('axios');
const app = express();
const ytdl = require('ytdl-core');
const scdl = require('soundcloud-downloader').default;
const Tiktok = require("@tobyg74/tiktok-api-dl");
const { TwitterDL } = require("twitter-downloader");
const instagramDl = require("@sasmeee/igdl");

app.get('/download', async (req, res) => {
    const url = req.query.url;

    if (!url) {
        res.status(400).send('URL não informada');
        return;
    }

    try {
        
        let attachment = await MediaDownloader(url, res);
        
        // res.header('Content-Disposition', `attachment; filename="${attachment.filename}"`);
        res.json({ download_url: `https://example.com/download?url=${encodeURIComponent(url)}` });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

const MediaDownloader = async (url, res) => {
    if (!url || !url.includes("http")) {
      throw new Error("Please specify a video URL...");
    }
    url = extractUrlFromString(url);

    if (url.includes("instagram.com/") || url.includes("instagram.com/")) {
      try {
        const dataList = await instagramDl(url);
        if (!dataList || !dataList[0]) {
          throw new Error("Error: Invalid video URL...");
        }
        const videoURL = dataList[0].download_link;
        const videofile = await downloadDirectVideo(videoURL, res);
  
        return videofile;
  
      } catch (error) {
        throw new Error("Error downloading or sending Instagram video: " + error.message);
      }
  
    } 
    else if (url.includes('tiktok.com/')) {
      try {
        const result = await Tiktok.Downloader(url, {
          version: "v2" //  version: "v1" | "v2" | "v3"
        });
  
        const videoLink = result.result.video;
        const videofile = await downloadDirectVideo(videoLink, res);
  
        return videofile;
      } catch (error) {
        throw new Error("Error downloading TikTok video: " + error.message);
      }
  
    } 
    else if (url.includes("youtu.be/") || url.includes("youtube.com/")) {
      try {
        const videoLink = await downloadYoutubeVideo(url, res);
        return videoLink;
      } catch (error) {
        throw new Error("Error downloading YouTube video: " + error.message);
      }
  
    }
     else if (url.includes("twitter.com") || url.includes("x.com/")) {
      const result = await TwitterDL(url, {
      })
      let videoLink = result.result.media[0].videos[result.result.media[0].videos.length - 1].url
      let attachment = await downloadDirectVideo(videoLink, res);

      return attachment;
    }
    else if (url.includes("soundcloud.com/")) {
      try {
        const videoLink = await downloadSouncloudAudio(url, res);
        return videoLink;
      } catch (error) {
        throw new Error("Error downloading SoundCloud audio: " + error.message);
      }
    }
    else {
      throw new Error("Please specify a video URL from Instagram, YouTube, or TikTok...");
    }
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

async function downloadDirectVideo(url, res) {
    try {

        const response = await axios({
            url: url,
            method: 'GET',
            responseType: 'stream'
        });

        // Check if the downloaded content is a MP4 video
        const contentType = response.headers['content-type'];
        
        // Set the response header for file download
        let attachment = res.header('Content-Disposition', `attachment; filename="vídeo.mp4"`);

        // Pipe the video stream directly to the response
        response.data.pipe(res);
        return attachment;
    } catch (error) {
        throw new Error(`An error occurred while downloading TikTok video: ${error.message}`);
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
        throw new Error("Error downloading YouTube video: " + error.message);
    }
}

async function downloadSouncloudAudio(trackUrl, res) {
    try {
        const info = await scdl.getInfo(trackUrl);
        const title = info.title;
        const stream = await scdl.download(trackUrl);

        const attachment = res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
        stream.pipe(res);

        return attachment;
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
