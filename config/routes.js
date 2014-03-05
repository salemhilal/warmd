var users = require('../app/controllers/user.js'),
    artists = require('../app/controllers/artist.js'),
    programs = require('../app/controllers/program.js'),
    express = require('express');

module.exports = function(app, config, passport) {

  // Health & sanity checking
  app.get("/ping", function(req,res) {
   res.end("pong");
  });


  // Register public folder as a static dir
  // app.use("/", );


  // Login
  app.get('/login', function(req, res, next) {
    if(req.user) {
      res.redirect('/');
    }
    next();
  }, users.login);

  app.get('/logout', users.logout);
  app.post('/users/session',
    passport.authenticate('local', {
      successRedirect: '/app',
      failureRedirect: '/login?success=false'
    }));

    /*app.post('/users/session', function(req, res, next) {
      passport.authenticate('local', function(err, user, info) {
        if (err) {
          console.log(err, info);
          return next(err);
        }
        if (!user) {
          console.log(err, info);
          return res.redirect('/login'); }
        req.login(user, function(err) {
          if (err) {
            console.log(err, info);
            return next(err);
          }
          return res.redirect('/users/' + user.username);
        });
      })(req, res, next);
    });*/

   /* User Routes */
   app.param('user', users.load);
   app.post('/users/new', users.create);
   app.get('/users/:user.:format', users.isAuthed, users.show);
   app.get('/users/:user', users.isAuthed, users.show);


   /* Artist Routes */
   app.param('artist', artists.load);
   app.post('/artists/query', users.isAuthed, artists.query);
   app.get('/artists/:artist.:format', users.isAuthed, artists.show);
   app.get('/artists/:artist', users.isAuthed, artists.show);

   /* Program Routes */
   app.param('program', programs.load);
   app.get('/programs/:program.:format', users.isAuthed, programs.show);
   app.get('/programs/:program', users.isAuthed, programs.show);

   /* Dead last thing to match */
   app.get('/', function(req, res, next) {
     res.redirect('/app');
   });

};
