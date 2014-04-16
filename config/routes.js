var users = require('../app/controllers/user.js'),
    artists = require('../app/controllers/artist.js'),
    programs = require('../app/controllers/program.js'),
    playlists = require('../app/controllers/playlist.js'),
    plays = require('../app/controllers/play.js'),
    album = require('../app/controllers/album.js'),
    review = require('../app/controllers/review.js'),
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
      successRedirect: '/app', //TODO: Send to req.session.returnTo if exists
      failureRedirect: '/login?success=false'
    }));

  // Get info about the current user
  app.get('/me',users.isAuthed, function(req, res) {
    req.user.
      load(['programs', 'reviews.album.artist']).
      then(function(data) {
        res.json(200, data.toJSON());
      })
  });


  //TODO: Make these have better RESTful names.
  // i.e. "artists" should refer to collections, "artist" to individuals
  /* User Routes */
  app.param('user', users.load);
  app.post('/users/new', users.create);
  app.get('/users/:user.:format', users.isAuthed, users.show);
  app.get('/users/:user', users.isAuthed, users.show);
  app.post('/users/query', users.query);

  /* Artist Routes */
  app.param('artist', artists.load);
  app.post('/artists/query', users.isAuthed, artists.query);
  app.get('/artists/:artist.:format', users.isAuthed, artists.show);
  app.get('/artists/:artist', users.isAuthed, artists.show);

  /* Program Routes */
  app.param('program', programs.load);
  //TODO: Get rid of :format stuff. This should all be json.
  app.get('/programs/:program.:format', programs.show);
  app.get('/programs/:program', programs.show);
  app.put('/programs/:program', programs.update);

  /* Playlist Routes */
  app.param('playlist', playlists.load);
  app.post('/playlists', users.isAuthed, playlists.create);
  app.get('/playlists/:playlist', playlists.show);
  app.put('/playlists/:playlist', users.isAuthed, playlists.update);

  /* Play Routes */
  app.param('play', plays.load);
  app.post('/plays', plays.create);
  app.post('/plays/query', plays.query);
  app.get('/plays/:play', plays.show);
  app.put('/plays/:play', plays.update);

  /* Album routes */
  //TODO: Move this into the albums controller
  app.param('album', album.load);
  app.get('/albums/:album', album.show);
  app.put('/albums/:album', album.update);
  app.get('/cover', album.cover);

  /* Review routes */
  app.param('review', review.load);
  app.get('/review/:review', review.show);

  /* Dead last thing to match */
  app.get('/', function(req, res, next) {
    res.redirect('/app');
  });

};
