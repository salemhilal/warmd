"use strict";

//================================
// Globals =======================
//================================

// Imports
var express = require('express'),
    app = express(),
    Bookshelf = require('bookshelf');
    

// Configs
var env = process.env.NODE_ENV || 'development',
    config = require('./config/config')[env];

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

// Express

// DB connection

// We add the db to the scope of the library
// Because javascript and awkward best practices.
Bookshelf.db = Bookshelf.initialize({
  client: 'mysql',
  connection: keys.mysql
});

var User = Bookshelf.db.Model.extend({
  tableName: "Users"
});

new User({"FName" : "Salem"})
  .fetch()
  .then(function(model){
    console.log(model.get('LName'));
  });

// Models

// Routes
require('./config/routes')(app);


//================================
// Initialize ====================
//================================

// Start app
var port = process.env.PORT || config.port || 3000;
app.listen(port);

console.log("\n\nWARMD now running on port " + port);
console.log("running in " + env + " environment");

// Expose app for testing purposes
exports = module.exports = app;
