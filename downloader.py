from os import path, makedirs, remove, listdir
from re import sub, search
from pytube import YouTube
from instaloader import Instaloader, Post
from moviepy.editor import VideoFileClip
from youtube_dl import YoutubeDL
from requests import get
from bs4 import BeautifulSoup
from sys import argv

nome_pasta = 'downloads'  # Pasta onde serão salvos os arquivos
script_dir = path.dirname(path.abspath(__file__))
download_dir = path.join(script_dir, nome_pasta)
makedirs(download_dir, exist_ok=True)

def download_youtube_video(url, file_format='mp4'):
    try:
        yt = YouTube(url)
        
        if file_format == 'mp3':
            stream = yt.streams.filter(only_audio=True).first()
        else:
            stream = yt.streams.get_highest_resolution()
        
        file_size = stream.filesize
        
        # Faz o download do arquivo.
        file_path = stream.download(output_path=download_dir)
        
        # Caso o formato solicitado seja mp3, converta o arquivo.
        if file_format == 'mp3':
            convert_to_mp3(file_path)

        return f"Download concluído: {file_path}"
    except Exception as e:
        return f"Erro ao baixar o vídeo: {e}"

def soundcloud_download(url, file_format='mp3'):
    try:
        ydl_opts = {
            'outtmpl': path.join(download_dir, '%(title)s.%(ext)s'),
            'format': 'bestaudio/best' if file_format == 'mp3' else 'bestvideo+bestaudio',
            'postprocessors': [{'key': 'FFmpegExtractAudio', 'preferredcodec': 'mp3'}] if file_format == 'mp3' else [],
        }
        with YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
        return "Download do SoundCloud concluído."
    except Exception as e:
        return f"Erro ao baixar o SoundCloud: {e}"

def downloader(url, file_name) -> str:
    try:
        response = get(url, stream=True)
        download_path = path.join(download_dir, file_name)

        with open(download_path, "wb") as file:
            for data in response.iter_content(1024):
                file.write(data)
        
        return f"Download concluído: {download_path}"
    except Exception as e:
        return f"Erro ao baixar o arquivo: {e}"

def download_twitter_video(url, file_format="mp3"):
    try:
        api_url = f"https://twitsave.com/info?url={url}"

        response = get(api_url)
        data = BeautifulSoup(response.text, "html.parser")
        download_button = data.find_all("div", class_="origin-top-right")[0]
        quality_buttons = download_button.find_all("a")
        highest_quality_url = quality_buttons[0].get("href")  # Melhor qualidade do video
        
        file_name = data.find_all("div", class_="leading-tight")[0].find_all("p", class_="m-2")[0].text # Nome do arquivo do video
        file_name = sub(r"[^a-zA-Z0-9]+", ' ', file_name).strip()  # Remove caracteres especiais do nome do arquivo
        file_name_with_ext = file_name + f".{file_format}"  # Nome do arquivo com a extensão apropriada

        return downloader(highest_quality_url, file_name)
    except Exception as e:
        return f"Erro ao baixar o vídeo do Twitter: {e}"

def convert_to_mp3(file_path):
    try:
        video_clip = VideoFileClip(file_path)
        audio_path = path.splitext(file_path)[0] + '.mp3'
        video_clip.audio.write_audiofile(audio_path)
        video_clip.close()

        return f"Arquivo convertido para MP3: {audio_path}"
    except Exception as e:
        return f"Erro ao converter para MP3: {e}"

username = None
password = None
def download_instagram_video(url, file_format='mp4', username=username, password=password):
    try:
        loader = Instaloader(download_videos=True)
        shortcode = search(r"/(?:p|reel)/([^/]+)/", url)
        if username: loader.login(username, password)  # Realiza a autenticação com suas credenciais loader

        if not shortcode:
            return "URL inválida. Não consegui encontrar o post da URL que foi fornecida."
        
        post = Post.from_shortcode(loader.context, shortcode.group(1))
        loader.dirname_pattern = download_dir
        loader.download_post(post, target=download_dir)
        
        if file_format == 'mp3':
            video_file = next(file for file in listdir(download_dir) if file.endswith('.mp4'))
            convert_to_mp3(path.join(download_dir, video_file))
        
        return "Download do Instagram concluído."
    
    except Exception as e:
        return f"Erro ao baixar o vídeo do Instagram: {e}"

def main(url):
    if 'youtube.com' in url or 'youtu.be' in url:
        return download_youtube_video(url)
    elif 'soundcloud.com' in url:
        return soundcloud_download(url)
    elif 'instagram.com' in url:
        return download_instagram_video(url)
    elif 'x.com' in url or 'twitter.com' in url:
        return download_twitter_video(url)
    else:
        return "Site não suportado. Atualmente suportamos apenas YouTube, Instagram, Twitter e SoundCloud."

if __name__ == '__main__':
    if len(argv) > 1:
        url = argv[1]
        print(main(url))
    else:
        print("No URL provided")