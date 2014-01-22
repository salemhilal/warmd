"use strict";

//================================
// Globals =======================
//================================

// Imports
var express = require('express'),
    fs = require('fs'),
    app = express();
    

// Configs
var env = process.env.NODE_ENV || 'development',
    config = require('./config/config')[env];

// Get the keys, check to make sure they exist
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

// Express

// DB connection

// Models

// Routes



//================================
// Initialize ====================
//================================

// Start app
var port = process.env.PORT || config.port || 3000;
app.listen(port);
console.log("WARMD now running on port " + port);
console.log("running in " + env + " environment");

// Expose app for testing purposes
exports = module.exports = app;
