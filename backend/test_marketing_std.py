import urllib.request
import json

url = "http://127.0.0.1:8001/analyze/marketing"
data = {
    "video_url": "https://youtube.com/...",
    "video_description": "A 15-second shoe ad showing someone running in the park with slow motion shots",
    "metrics": {
        "ctr": 0.3,
        "watch_time": 1.5
    },
    "target_audience": "Athletes aged 20-35"
}

req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as response:
        print(f"Status: {response.getcode()}")
        print(json.dumps(json.loads(response.read().decode('utf-8')), indent=2))
except Exception as e:
    print(f"Error: {e}")
