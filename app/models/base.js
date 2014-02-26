"use strict";
// Root model that other models inherit from

var db = require("bookshelf").DB;


db.Model = db.Model.extend({

  hasTimestamps: true, 

}, {

});
