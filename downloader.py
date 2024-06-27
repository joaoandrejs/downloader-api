from os import path, makedirs, remove, listdir
from re import sub, search
from pytube import YouTube
from instaloader import Instaloader, Post
from moviepy.editor import VideoFileClip
from youtube_dl import YoutubeDL
from requests import get
from tqdm import tqdm
from bs4 import BeautifulSoup
from sys import argv

nome_pasta = 'downloads' # Pasta onde serão salvos os arquivos
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
        print(f"Tamanho do arquivo: {file_size / (1024 * 1024):.2f} MB")
        
        # Cria uma barra de progresso.
        progress_bar = tqdm(total=file_size, unit='B', unit_scale=True, desc=f'Baixando')
        
        # Define uma função de progresso personalizada.
        def progress_function(stream, chunk, bytes_remaining):
            progress_bar.update(len(chunk))
        
        yt.register_on_progress_callback(progress_function)
        
        # Faz o download do arquivo.
        file_path = stream.download(output_path=download_dir)
        
        # Fecha a barra de progresso.
        progress_bar.close()
        
        # Caso o formato solicitado seja mp3, converta o arquivo.
        if file_format == 'mp3':
            convert_to_mp3(file_path)

        return file_path
    except Exception as e:
        print(f"Ocorreu um erro ao baixar o vídeo:\n\n{e}")
        return False

def soundcloud_download(url, file_format='mp3'):
    try:
        # Inicializar a barra de progresso fora das funções de callback
        progress_bar = tqdm(unit='B', unit_scale=True, desc='Baixando')

        def progress_hook(d):
            if d['status'] == 'downloading':
                progress_bar.total = d.get('total_bytes', 0) or d.get('total_bytes_estimate', 0)
                progress_bar.update(d.get('downloaded_bytes', 0) - progress_bar.n)
            elif d['status'] == 'finished':
                progress_bar.close()

        ydl_opts = {
            'outtmpl': path.join(download_dir, '%(title)s.%(ext)s'),
            'format': 'bestaudio/best' if file_format == 'mp3' else 'bestvideo+bestaudio',
            'postprocessors': [{'key': 'FFmpegExtractAudio', 'preferredcodec': 'mp3'}] if file_format == 'mp3' else [],
            'progress_hooks': [progress_hook],
        }
        with YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
        return True
    except Exception as e:
        print(f"Ocorreu um erro ao baixar o vídeo:\n\n{e}")
        return False

def downloader(url, file_name) -> None:
    response = get(url, stream=True)
    total_size = int(response.headers.get("content-length", 0))
    block_size = 1024
    progress_bar = tqdm(total=total_size, unit="B", unit_scale=True, desc='Baixando')
    
    download_path = path.join(download_dir, file_name)

    with open(download_path, "wb") as file:
        for data in response.iter_content(block_size):
            progress_bar.update(len(data))
            file.write(data)
    progress_bar.close()
    
    return download_path

def download_twitter_video(url, file_format="mp3"):
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

def convert_to_mp3(file_path):
    try:
        mp3 = input('Deseja converter para áudio? (S/N): ') 

        if mp3.lower() == 's':
            video_clip = VideoFileClip(file_path)
            audio_path = path.splitext(file_path)[0] + '.mp3'
            video_clip.audio.write_audiofile(audio_path)
            video_clip.close()
            erase = input('Deseja remover o arquivo original? (S/N): ') 

            if erase.lower() == 's':
                remove(file_path)
                print(f"Deletado e convertido para áudio.")
            else:
                print(f"Convertido para áudio.")
                return;
        else:
            return;
        
    except Exception as e:
        print(f"Ocorreu um erro ao converter o arquivo para áudio:\n\n{e}")
        return False

username = None
password = None
def download_instagram_video(url, file_format='mp4', username=username, password=password):
    try:
        loader = Instaloader(download_videos=True)
        shortcode = search(r"/(?:p|reel)/([^/]+)/", url)
        if username: loader.login(username, password)  # Realiza a autenticação com suas credenciais loader

        if not shortcode:
            print("URL inválida. Não consegui encontrar o post da URL que foi fornecida.")
            return False
        
        post = Post.from_shortcode(loader.context, shortcode.group(1))
        loader.dirname_pattern = download_dir
        loader.download_post(post, target=download_dir)
        
        if file_format == 'mp3':
            video_file = next(file for file in listdir(download_dir) if file.endswith('.mp4'))
            convert_to_mp3(path.join(download_dir, video_file))
        
        return True
    
    except Exception as e:
        print(f"Erro ao baixar o vídeo: {e}")
        return False

def main(url):
    # url = input("URL do vídeo: ")
    
    if 'youtube.com' in url or 'youtu.be' in url:
        file_path = download_youtube_video(url)
    elif 'soundcloud.com' in url:
        file_path = soundcloud_download(url)
    elif 'instagram.com' in url:
        file_path = download_instagram_video(url)
    elif 'x.com' in url or 'twitter.com' in url:
        file_path = download_twitter_video(url)
    else:
        print("Site não suportado. Atualmente só os seguintes sites: YouTube, Instagram, Twitter, e SoundCloud.")
    return file_path

if __name__ == '__main__':

    # print('______                    _                 _           ') 
    # print('|  _  \                  | |               | |          ')
    # print('| | | |_____      ___ __ | | ___   __ _  __| | ___ _ __ ')
    # print('| | | / _ \ \ /\ / / \'_ \| |/ _ \ / _` |/ _` |/ _ \ \'__|')
    # print('| |/ / (_) \ V  V /| | | | | (_) | (_| | (_| |  __/ |   ')
    # print('|___/ \___/ \_/\_/ |_| |_|_|\___/ \__,_|\__,_|\___|_|   ')
    # print('Sites: YouTube, SoundCloud, Instagram, Twitter/X')
    # print('')

    
    if len(argv) > 1:
        url = argv[1];
        main(url)
        # convert_to_mp3(file_path)
        # video_url = sys.argv[1]
        # download_video(video_url)
    else:
        print("No URL provided")


    