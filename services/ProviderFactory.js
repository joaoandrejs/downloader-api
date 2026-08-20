const UniversalProvider = require('./providers/UniversalProvider');

// Agora temos uma única dependência robusta para tudo
const providers = [
    new UniversalProvider()
];

class ProviderFactory {
    static getProvider(url) {
        const provider = providers.find(p => p.canHandle(url));
        if (!provider) {
            throw new Error("URL não suportada.");
        }
        return provider;
    }
}

module.exports = ProviderFactory;