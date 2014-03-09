"use strict";

//================================
// Globals =======================
//================================

// Imports
var express = require('express'),
    expressValidator = require('express-validator'),
    passport = require('passport'),
    crypto = require('crypto'),
    https = require('https'), // uncomment for production on current.
    fs = require('fs'),
    app = express(),
    Bookshelf = require('bookshelf');


// Configs
var env = process.env.NODE_ENV || 'development',
    config = require('./config/config')[env];

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
}
catch (err) {
  if(err.code === 'MODULE_NOT_FOUND'){
    console.error("\n\nMake sure you've created config/keys.js\n", err, "\n\n");
    return;
  }
  else {
    throw err;
  }
}

//================================
// Bootstrapping  ================
//================================

// DB connection

// We add the db to the scope of the library
// Because javascript and awkward best practices.
Bookshelf.DB = Bookshelf.initialize({
  client: 'mysql',
  connection: keys.mysql,
  debug: config.debug
});


// Models (must be first to allow access to globals)
Bookshelf.DB.User = require("./app/models/user.js");
Bookshelf.DB.Artist = require("./app/models/artist.js");
Bookshelf.DB.Program = require("./app/models/program.js");

// Passport
require('./config/passport')(passport, config);

// Express
require("./config/express")(app, config, passport);

// Routes
require('./config/routes')(app, config, passport);

//================================
// Initialize ====================
//================================

// Start app
var port = process.env.PORT || config.port || 3000;
var server = https.createServer(options, app).listen(port, function(){
   //app.listen(port);

   console.log("\n\nWARMD now running on port " + port);
   console.log("running in " + env + " environment");

   if(config.verbose) {
     console.log("Verbose mode on");
   }
});

// Expose app for testing purposes
exports = module.exports = app;
