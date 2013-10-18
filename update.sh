#!/bin/sh

echo -e "Installing bower components...\n"
bower install
echo -e "Installing non bower components...\n"
#cd vendors/phaser && git pull
git submodule update
