'use strict';

var DB = require('bookshelf').DB,
    Program = require('./program'),
    Review = require('./review'),
    checkit = require('checkit');

var User = DB.Model.extend({

  tableName: 'Users',    // What table we're querying from
  idAttribute: 'UserID', // The column representing sentinel id's

  hidden: ['Password'],  // Use the visibility plugin to never render passwords

  initialize: function() {
    this.on('saving', this.validateSave);
  },

  validateSave: function() {
    var user = this;
    return checkit({
      Password: ['required'],
      User: ['required', function(user) {
        return DB.knex.select().from('Users').where('User', 'like', user)
          .tap(function(models) {
            if (models.length) { 
              throw new Error('That username is already in use'); 
            }
          });
      }],
      FName: 'required',
      LName: 'required', 
      Email: ['required', 'email', function(email) {
        return DB.knex.select().from('Users').where('Email', 'like', email.toLowerCase().trim())
          .tap(function(models) {
            if (models.length) { 
              throw new Error('That email address is already in use'); 
            }
          });
      }],
    }).run(this.attributes);
  },

  programs: function() {
    return this.hasMany(Program.model, 'UserID');
  },

  reviews: function() {
    return this.hasMany(Review.model, 'UserID');
  }

});

var Users = DB.Collection.extend({
  model: User,
});


exports.model = User;
exports.collection = Users;
