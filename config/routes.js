var users = require('../app/controllers/user.js'),
    artists = require('../app/controllers/artist.js'),
    programs = require('../app/controllers/program.js'),
    playlists = require('../app/controllers/playlist.js'),
    plays = require('../app/controllers/play.js'),
    express = require('express');

module.exports = function(app, config, passport) {

  // Health & sanity checking
  app.get("/ping", function(req,res) {
   res.end("pong");
  });

  /* Login and Session Routes */
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

  app.get('/me',users.isAuthed, function(req, res, next) {
    res.json(req.user.toJSON());
  });

  /* User Routes */
  app.param('user', users.load);
  app.post('/users/new', users.create);
  app.get('/users/:user.:format', users.isAuthed, users.show);
  app.get('/users/:user', users.isAuthed, users.isPriv, users.show);
  app.post('/users/query', users.query);

  /* Artist Routes */
  app.param('artist', artists.load);
  app.post('/artists/query', users.isAuthed, artists.query);
  app.get('/artists/:artist.:format', users.isAuthed, artists.show);
  app.get('/artists/:artist', users.isAuthed, artists.show);

  /* Program Routes */
  app.param('program', programs.load);
  app.get('/programs/:program.:format', programs.show);
  app.get('/programs/:program', programs.show);

  /* Playlist Routes */
  app.param('playlist', playlists.load);
  app.post('/playlists', users.isAuthed, playlists.create);
  app.get('/playlists/:playlist', playlists.show);
  app.put('/playlists/:playlist', users.isAuthed, playlists.update);

  /* Play Routes */
  app.post('/plays', plays.create);
  app.post('/plays/query', plays.query);

  /* Dead last thing to match */
  app.get('/', function(req, res, next) {
    res.redirect('/app');
  });

};
