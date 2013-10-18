#!/bin/sh

echo -e "Installing bower components..."
bower install
echo -e "Installing non bower components..."
#cd vendors/phaser && git pull
git submodule update
