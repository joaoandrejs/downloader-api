# Video Downloader API
 API para download de vídeos

### Sites suportados:
- YouTube
- Instagram
- TikTok
- Twitter
- SoundCloud

## Instalação

```bash
git clone https://github.com/joaoandrejs/downloader-api
```

```bash
cd downloader-api
```

```bash
npm install
```

## Executando

```bash
node index.js
```

## Teste a aplicação:

```bash
curl http://localhost:3000/
```
- Resposta: App is running...


# Rspostas:
`curl http://localhost:3000/api/getinfo?url=...`
- JSON retornado com as informações do vídeo
```js
{
    author: {
        name: "",
        id: "",
        description: ""
    },
    video: {
        url: "",
        title: "",
        description: "",
        thumbnail: "",
        lengthSeconds: "",
        viewCount: ""
    }
}
```

`curl http://localhost:3000/api/download?url=...`
- Retorna um arquivo ".mp4" para vídeos e ".mp3" para áudios
