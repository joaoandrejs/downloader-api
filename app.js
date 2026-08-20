const express = require('express');
const { downloadVideo, getVideoInfo } = require('./controllers/VideoController');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/download', downloadVideo);
app.get('/api/getinfo', getVideoInfo);

app.listen(PORT, () => console.log(`[SERVER] Rodando na porta: ${PORT}`));