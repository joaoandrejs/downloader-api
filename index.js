const express = require('express');
const { exec } = require('child_process');

const app = express();

app.get('/download', async (req, res) => {
  const videoURL = req.query.url;

  if (!videoURL) {
    return res.status(400).send('No URL provided');
  }

  // Execute o script Python
  exec(`python3 downloader.py ${videoURL}`, (error, stdout, stderr) => {
    if (error) {
        console.error(`Erro ao executar o comando: ${error.message}`);
        return res.status(500).json({ error: 'Erro ao baixar o vídeo' });
    }
    if (stderr) {
        console.error(`Erro no stderr: ${stderr}`);
        return res.status(500).json({ error: 'Erro ao baixar o vídeo' });
    }

    console.log(`Saída do comando: ${stdout}`);
    res.json({ message: 'Vídeo baixado com sucesso' });
  });
}
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em: ${PORT}`);
});
