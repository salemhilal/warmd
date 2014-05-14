"use strict";

//================================
// Globals =======================
//================================

// Imports
var express = require('express'),
  passport = require('passport'),
  crypto = require('crypto'),
  https = require('https'),
  fs = require('fs'),
  app = express(),
  Bookshelf = require('bookshelf');


// Configs
var env = process.env.NODE_ENV || 'development',
  config = require('./config/config')[env],
  wlog = require('./config/logger'),
  mail = require('./config/mailer');

// HTTPS/SSL
var options = {
  key: fs.readFileSync('./config/server-key.pem'),
  cert: fs.readFileSync('./config/server-cert.pem'),
  // This is only necessary if using the client cert authentication
  requestCert: true,

  // This is only necessary if client uses self-signed cert
  //ca: [ fs.readFileSync('client-cert.pem')]
};

// Get the keys, check to make sure they exist
var keys;
try {
  keys = require('./config/keys')[env];
} catch (err) {
  if (err.code === 'MODULE_NOT_FOUND') {
    console.error("\n\nMake sure you've created config/keys.js\n", err, "\n\n");
    // return;
  } else {
    throw err;
  }
}

//================================
// Bootstrapping  ================
//================================

// DB connection

// TODO: All this in a config file mayhaps?
// We add the db to the scope of the library
// Because javascript and awkward best practices.
Bookshelf.DB = Bookshelf.initialize({
  client: 'mysql',
  connection: keys.mysql,
  debug: config.debug
});
// Use bookshelf plugins
Bookshelf.DB.plugin('visibility');

// Passport
require('./config/passport')(passport, config);

// Express config, routes
require("./config/express")(app, config, passport);

//================================
// Initialize ====================
//================================

// Start app
var port = process.env.PORT || config.port || 3000;
var server = https.createServer(options, app).listen(port, function() {

  wlog.info("\n\nWARMD now running on port " + port);
  wlog.info("running in " + env + " environment");
  if (config.verbose) {
    console.log("Verbose mode on");
  }
});

// Expose app for testing purposes
exports = module.exports = app;
