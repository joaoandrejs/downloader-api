const express = require('express');
const ytdl = require('ytdl-core');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();

app.get('/download', async (req, res) => {
  const videoURL = req.query.url;

  if (!videoURL) {
    return res.status(400).send('No URL provided');
  }

  // Execute o script Python
  exec(`python3 downloader.py ${videoURL}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).send('Error downloading video');
    }

    // Verifique se o vídeo foi baixado
    const filePath = path.resolve(__dirname, 'downloaded_video.mp4');
    if (fs.existsSync(filePath)) {
      res.download(filePath, 'video.mp4', (err) => {
        if (err) {
          console.error(`download error: ${err}`);
          res.status(500).send('Error sending file');
        } else {
          // Remova o arquivo após o download
          fs.unlinkSync(filePath);
        }
      });
    } else {
      res.status(500).send('Video not found');
    }
  });
  
//   res.header('Content-Disposition', 'attachment; filename="video.mp4"');
//   ytdl(videoURL, {
//     format: 'mp4'
//   }).pipe(res);

});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
