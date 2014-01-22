"use strict";

//================================
// Globals =======================
//================================

// Imports
var express = require('express'),
    fs = require('fs');

// Misc
var env = process.env.NODE_ENV || 'development',
    config = require('/.config/config')[env];

var keys;
try {
  keys = require('./config/keys');
}
catch (err) {
  if(err.code === 'MODULE_NOT_FOUND'){
    console.error("\n\nMake sure you've created config/keys.js\n", err, "\n\n");
    return;
  }
  else throw err;
}

//================================
// Bootstrapping  ================
//================================





//================================
// Initialize ====================
//================================

// Start app

// Expose app for testing purposes
exports = module.exports = app;
