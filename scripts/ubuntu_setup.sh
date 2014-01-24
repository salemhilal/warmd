#!/bin/bash

# Install node deps
sudo apt-get -qq install g++ curl libssl-dev apache2-utils 
sudo apt-get -qq install git-core

# Install node
git clone git://github.com/ry/node.git
cd node
./configure
make
sudo make install
