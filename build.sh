#!/bin/sh

echo -e 'Initializing non bower components...'
git submodule init
echo -e 'Installing npm components...'
npm install
if [[ $0 -ne 0 ]]; then
  exit
fi
sh update.sh
grunt