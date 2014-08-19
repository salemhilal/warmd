/* jshint node: true */
'use strict';

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
  bookshelf = require('bookshelf'),
  knex = require('knex');


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
// Database ======================
//================================

var knexConfig = knex({
  client: 'mysql',
  connection: keys.mysql,
  debug: config.debug
});
var db = bookshelf(knexConfig);                     // Initialize Bookshelf
db.plugin('visibility');                            // Use visibility plugin
bookshelf.DB = db;                                  // Expose globally 
app.set('bookshelf', bookshelf);
require('./config/passport')(passport, config);     // Passport
require("./config/express")(app, config, passport); // Express config, routes

//================================
// Initialize ====================
//================================

// Start app
var port = process.env.PORT || config.port || 3000;
var server = https.createServer(options, app).listen(port, function() {
  wlog.info('__          __     _____  __  __ _____  ');
  wlog.info('\\ \\        / /\\   |  __ \\|  \\/  |  __ \\ ');
  wlog.info(' \\ \\  /\\  / /  \\  | |__) | \\  / | |  | |');
  wlog.info('  \\ \\/  \\/ / /\\ \\ |  _  /| |\\/| | |  | |');
  wlog.info('   \\  /\\  / ____ \\| | \\ \\| |  | | |__| |');
  wlog.info('    \\/  \\/_/    \\_\\_|  \\_\\_|  |_|_____/ ');
  wlog.info('');

  wlog.info("WARMD now running on port " +port+ " in " +env+ " environment");
  if (config.verbose) {
    console.log("Verbose mode on");
  }
});

// Expose app for testing purposes
exports = module.exports = app;
