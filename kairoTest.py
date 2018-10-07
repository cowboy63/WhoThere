#!/usr/bin/env python

import requests

# put your keys in the header
headers = {
    "app_id": "1f788f26",
    "app_key": "e6dfdaa5f783fea10f47bd795ddb8482"
}

payload = '{"image":"https://avatars0.githubusercontent.com/u/13722707?s=460&v=4"}'

url = "http://api.kairos.com/detect"

# make request
r = requests.post(url, data=payload, headers=headers)
print (r.content)