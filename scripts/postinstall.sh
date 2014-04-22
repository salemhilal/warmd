#!/bin/bash

# Enhance path with node binaries
# export PATH=$PATH:./node_modules/.bin

# Make sure we're in the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $SCRIPT_DIR

# Make log folder
mkdir -p ../logs

# Copy keys if we're on travis so that warmd knows where to look
if [ "$TRAVIS" = true ]; then
	cp ../config/keys.example.js ../config/keys.js
fi
