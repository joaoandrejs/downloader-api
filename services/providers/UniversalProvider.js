const { spawn } = require('child_process');

class UniversalProvider {
    canHandle(url) {
        const supportedDomains = ['instagram.com', 'tiktok.com', 'twitter.com', 'x.com', 'youtube.com', 'youtu.be', 'soundcloud.com'];
        return supportedDomains.some(domain => url.includes(domain));
    }

    getInfo(url) {
        return new Promise((resolve, reject) => {
            const process = spawn('yt-dlp', ['--dump-json', '--no-warnings', url]);
            let output = '';
            let errorOutput = '';

            process.stdout.on('data', (data) => output += data.toString());
            process.stderr.on('data', (data) => errorOutput += data.toString());

            process.on('close', (code) => {
                if (code !== 0) return reject(new Error(errorOutput || 'Erro no processo do yt-dlp'));
                
                try {
                    const parsed = JSON.parse(output);
                    resolve({
                        author: {
                            name: parsed.uploader || parsed.channel || "Desconhecido",
                            id: parsed.uploader_id || null,
                        },
                        video: {
                            url: parsed.url || null,
                            title: parsed.title || null,
                            description: parsed.description || null,
                            thumbnail: parsed.thumbnail || null,
                            lengthSeconds: parsed.duration || null,
                        }
                    });
                } catch (e) {
                    reject(new Error("Falha ao processar dados do yt-dlp"));
                }
            });
        });
    }

    async download(url, res) {
        const isAudio = url.includes('soundcloud.com');
        const extension = isAudio ? 'mp3' : 'mp4';
        const format = isAudio ? 'bestaudio' : 'best';

        // Define o header. (Para acelerar o início do download, omitimos a busca prévia do título)
        res.header('Content-Disposition', `attachment; filename="download.${extension}"`);

        // Executa o yt-dlp global do Arch Linux apontando a saída para o stdout ('-o', '-')
        const ytProcess = spawn('yt-dlp', [
            '-f', format,
            '--no-warnings',
            '-o', '-', 
            url
        ]);

        // Conecta o fluxo de dados (pipe) diretamente para a resposta HTTP do Express
        ytProcess.stdout.pipe(res);

        // Se der algum erro em background, agora veremos no console do servidor
        ytProcess.stderr.on('data', (data) => {
            console.error(`[yt-dlp CLI]: ${data.toString().trim()}`);
        });

        ytProcess.on('close', (code) => {
            if (code !== 0 && !res.headersSent) {
                res.status(500).json({ error: "Falha ao transmitir o vídeo." });
            }
        });
    }
}

module.exports = UniversalProvider;