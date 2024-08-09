import sys
import trafilatura
import json
import uuid
import clipboard


if len(sys.argv) != 2:
	print("Usage: python fetch.py <url>")
	sys.exit(1)

url = sys.argv[1]
downloaded = trafilatura.fetch_url(url)
text = trafilatura.extract(downloaded)

data = {
	"type": "Text",
	"text": {
		"type": "Text",
                "id": str(uuid.uuid4()),
       	        "name": url,
		"content": text
	}
}

json_string = json.dumps(data)
clipboard.copy(json_string)
print("Copied to clipboard!")
