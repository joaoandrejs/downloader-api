const express = require('express');
const app = express();
const { spawn } = require('child_process');

app.get('/download', (req, res) => {
    const url = req.query.url;

    // Executa o script Python para baixar o arquivo
    const python = spawn('python', ['downloader.py', url]);

    python.stdout.on('data', (data) => {
        console.log('Python stdout:', data.toString());
        res.send(data.toString());
    });

    python.stderr.on('data', (data) => {
        console.error('Python stderr:', data.toString());
        res.status(500).send(data.toString());
    });

    python.on('close', (code) => {
        console.log(`Python processo encerrado com código ${code}`);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});