#!/bin/sh

echo -e 'Installing npm components...'
npm install
if [[ $0 -ne 0 ]]; then
  exit
fi
sh update.sh
grunt