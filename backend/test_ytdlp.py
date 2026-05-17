import yt_dlp

url = "https://www.youtube.com/watch?v=ScMzIvxBSi4"
try:
    print(f"Fetching info for {url}...")
    with yt_dlp.YoutubeDL({'quiet': True}) as ydl:
        info = ydl.extract_info(url, download=False)
        print(f"Success! Title: {info.get('title')}, Duration: {info.get('duration')}s")
except Exception as e:
    print(f"Error: {e}")
