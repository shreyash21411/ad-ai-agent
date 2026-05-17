import requests
import json

url = "http://127.0.0.1:8001/analyze/marketing"
payload = {
    "video_url": "https://youtube.com/...",
    "video_description": "A 15-second shoe ad showing someone running in the park with slow motion shots",
    "metrics": {
        "ctr": 0.3,
        "watch_time": 1.5
    },
    "target_audience": "Athletes aged 20-35"
}

try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print("Response JSON:")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")
