#!/usr/bin/python

import requests

url = "https://api.kairos.com/detect"

headers = {
    'app_id': '1f788f26',
    'app_key': 'e6dfdaa5f783fea10f47bd795ddb8482'
    }

files = {'image': open('name.jpeg', 'rb')}

r = requests.post( url, headers=headers, files=files )

print (r.text)


