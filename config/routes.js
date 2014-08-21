'use strict';

var users = require('../app/controllers/user'),
    artists = require('../app/controllers/artist'),
    programs = require('../app/controllers/program'),
    playlists = require('../app/controllers/playlist'),
    plays = require('../app/controllers/play'),
    album = require('../app/controllers/album'),
    review = require('../app/controllers/review'),
    util = require('./middlewares/utils'),
    express = require('express');

module.exports = function(app, config, passport) {

  /* Health & sanity checking */
  app.route('/ping').get(function(req,res) {
   res.end('pong');
  });

  /* User login endpoint */
  app.route('/login').get(function(req, res, next) {
    if(req.user) { 
      res.redirect('/'); 
    } else {
      next(); 
    }
  }, users.login);

  /* User logout endpoint */
  app.route('/logout').get(users.logout);

  /* Session init endpoint */
  app.route('/users/session').
    get(function(req, res) {
      res.redirect('/');
    }).
    post(passport.authenticate('local', {
      successRedirect: '/app', 
      failureRedirect: '/login?success=false'
    }));

  /* Get info about the current user */
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
  // i.e. 'artists' should refer to collections, 'artist' to individuals

  /* User Routes */
  var userRouter = express.Router().
    param('user', users.load).
    post('/query', users.isAuthed, users.query).
    post('/new', users.create). 
    get('/pending', users.isAuthed, util.hasAccess('Admin'), users.pending).
    post('/approve', users.isAuthed, util.hasAccess('Admin'), users.approve).
    post('/exists', users.exists).
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
    put('/:program', users.isAuthed, programs.update);
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
    post('/', users.isAuthed, plays.create).
    post('/query', plays.query).
    get('/:play', plays.show).
    put('/:play', users.isAuthed, plays.update);
  app.use('/plays', playRouter);

  /* Album routes */
  var albumRouter = express.Router().
    param('album', album.load).
    post('/query', users.isAuthed, album.query).
    get('/cover', users.isAuthed, album.cover).
    get('/:album', users.isAuthed, album.show).
    put('/:album', users.isAuthed, album.update);
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
