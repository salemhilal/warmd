#!/bin/bash

# Install node deps, and also node
sudo add-apt-repository -qq ppa:chris-lea/node.js
sudo apt-get update
sudo apt-get -qq install python-software-properties python g++ make nodejs
sudo apt-get -qq install git-core
