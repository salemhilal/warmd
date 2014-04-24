#!/bin/bash

# Make sure we have access to add-apt-repository
sudo apt-get -qq install software-properties-common python-software-properties
# Add current nodejs repo
sudo add-apt-repository -qq ppa:chris-lea/node.js
# Update erythang
sudo apt-get update
# Install node and its deps
sudo apt-get -qq install python-software-properties python g++ make nodejs
# Install git
sudo apt-get -qq install git-core
# Install server dependencies
npm install
