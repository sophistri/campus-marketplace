#!/bin/sh
set -eu

: "${API_URL:?ERROR: API_URL must be set}"

envsubst '${API_URL}' \
  < /opt/app-config/config.template.js \
  > /usr/share/nginx/html/config.js