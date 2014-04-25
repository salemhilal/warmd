"use strict";

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
  app.route("/ping").get(function(req,res) {
   res.end("pong");
  });

  /* Login and Session Routes */
  app.route('/login').get(function(req, res, next) {
    if(req.user) {
      res.redirect('/');
    }
    next();
  }, users.login);
  app.route('/logout').get(users.logout);
  app.route('/users/session').
    post(passport.authenticate('local', {
      successRedirect: '/app', //TODO: Send to req.session.returnTo if exists
      failureRedirect: '/login?success=false'
    }));

  // Get info about the current user
  // TODO: Move to Users controller
  app.route('/me').get(users.isAuthed, function(req, res) {
    req.user.
      load(['programs', 'reviews.album.artist']).
      then(function(data) {
        res.json(200, data.toJSON());
      });
  });


  //TODO: Auth all of these as necessary, you idiot.
  //TODO: Make these have better RESTful names.
  // i.e. "artists" should refer to collections, "artist" to individuals

  /* User Routes */
  var userRouter = express.Router().
    param('user', users.load).
    post('/query', users.query).
    post('/new', users.create).
    get('/:user', users.isAuthed, users.show);
  app.use('/users', userRouter);

  /* Artist Routes */
  var artistRouter = express.Router().
    param('artist', artists.load).
    post('/query', users.isAuthed, artists.query).
    get('/:artist', users.isAuthed, artists.show);
  app.use('/artists', artistRouter);

  /* Program Routes */
  var programRouter = express.Router().
    param('program', programs.load).
    get('/:program', programs.show).
    put('/:program', programs.update);
  app.use('/programs', programRouter);

  /* Playlist Routes */
  var playlistRouter = express.Router().
    param('playlist', playlists.load).
    post('/', users.isAuthed, playlists.create).
    get('/:playlist', playlists.show).
    put('/:playlist', users.isAuthed, playlists.update);
  app.use('/playlists', playlistRouter);

  /* Play Routes */
  var playRouter = express.Router().
    param('play', plays.load).
    post('/', plays.create).
    post('/query', plays.query).
    get('/:play', plays.show).
    put('/:play', plays.update);
  app.use('/plays', playRouter);

  /* Album routes */
  var albumRouter = express.Router().
    param('album', album.load).
    post('/query', album.query).
    get('/cover', album.cover).
    get('/:album', album.show).
    put('/:album', album.update);
  app.use('/albums', albumRouter);

  /* Review routes */
  var reviewRouter = express.Router().
    param('review', review.load).
    get('/:review', review.show).
    post('/', review.create);
  app.use('/reviews', reviewRouter);

  /* Dead last thing to match */
  app.get('/', function(req, res) {
    res.redirect('/app');
  });

};
