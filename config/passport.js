var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    User = DB.User,
    DB = require('bookshelf').DB;


module.exports = function (passport, config) {

      // serialize sessions
      passport.serializeUser(function(user, done) {
            done(null, user.id)
            })

   passport.deserializeUser(function(id, done) {
         User.findOne({ _id: id }, function (err, user) {
            done(err, user)
            })
         })

   // use local strategy
   passport.use(new LocalStrategy({
      function (username, password, done){
      User.authenticate

   }
