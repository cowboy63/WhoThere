#!/usr/bin/python

import requests
import base64

url = "https://api.kairos.com/detect"

headers = {
   'app_id': '1f788f26',
    'app_key': 'e6dfdaa5f783fea10f47bd795ddb8482',
    'content-type': 'application/json'
    }


with open("name.png", "rb") as image_file:
    encoded_string = base64.b64encode(image_file.read())

payload = "{\"image\":\"" + encoded_string + "\"}"

r = requests.post(url, headers=headers, data=payload)

print (r.text)


