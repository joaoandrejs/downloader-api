const ProviderFactory = require('../services/ProviderFactory');
const { extractUrlFromString } = require('../utils/functions');

exports.downloadVideo = async (req, res) => {
    try {
        const url = extractUrlFromString(req.query.url);
        if (!url) return res.status(400).json({ error: 'URL not specified' });

        const provider = ProviderFactory.getProvider(url);
        await provider.download(url, res);

    } catch (error) {
        // Extrai o erro real vindo de processos em background (stderr)
        const errorMessage = error.stderr || error.message || "Erro desconhecido";
        
        console.error("[CRITICAL ERROR]:", errorMessage);
        
        res.status(400).json({ 
            message: "Erro ao processar download", 
            error: errorMessage.toString() 
        });
    }
};

exports.getVideoInfo = async (req, res) => {
    try {
        const url = extractUrlFromString(req.query.url);
        if (!url) return res.status(400).json({ error: 'URL inválida' });

        const provider = ProviderFactory.getProvider(url);
        const info = await provider.getInfo(url);
        
        res.status(200).json(info);

    } catch (error) {
        res.status(400).json({ message: "Erro ao obter informações", error: error.message });
    }
};