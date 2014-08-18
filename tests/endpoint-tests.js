'use strict';
/* Test all sorts of endpoints */

/* global describe, it, before */

var should = require('should'),
    request = require('supertest'),
    app = require('../server'),
    context = describe;


describe('Endpoints', function() {

  describe('server active', function() {
    it('should be alive', function(done) {
      request.agent(app).
        get('/ping').
      end(function(err, res) {
        should.not.exist(err);
        should.exist(res);
        res.should.have.status(200);
        res.should.be.ok;

        done();
      });
    });
  });

  describe('dealing with users', function() {

    var Tom;

    before(function(done) {
      Tom = request.agent(app);
      Tom.post('/users/session').
        send({
          username: 'Tom',
          password: 'test'
        }).
      end(function(err, res) {
        if (err) {
          return done(err);
        }
        done();
      });
    });
    it('should be /me', function(done) {
      Tom.
        get('/me').
      end(function(err, res) {
        should.not.exist(err);
        should.exist(res);
        res.should.be.json;
        res.should.have.status(200);
        res.body.should.be.type('object');
        res.body.should.not.be.empty;
        res.body.User.should.equal('Tom');

        done();
      });
    });

    it('should see mcbaron at /users/571', function(done) {
      Tom.
        get('/users/571').
      end(function(err, res) {
        should.not.exist(err);
        should.exist(res);
        should.exist(res.body);
        res.should.be.json;
        res.should.have.status(200);
        res.body.WRCTUser.should.match(/^[_a-z0-9-]+(\.[_a-z0-9-]+)*@WRCT.ORG/);
        res.body.User.should.equal('mcbaron');
        res.body.UserID.should.be.ok;

        done();
      });
    });

    it('should find an array of "Matt\'s" at /users/query', function(done) {
      Tom.
        post('/users/query').
        send({
          query: 'matt'
        }).
      end(function(err, res) {
        should.not.exist(err);
        should.exist(res);
        should.exist(res.body);
        res.should.be.json;
        res.should.have.status(200);
        res.body.should.be.type('object');
        res.body.should.be.an.instanceOf(Array);
        res.body.should.not.be.empty;
        res.body.should.containDeep([{
            User: 'msiko'
          }]);

        done();
      });
    });
  });

  describe('dealing with artists', function() {

    var Tom;

    before(function(done) {
      Tom = request.agent(app);
      Tom.post('/users/session').
        send({
          username: 'Tom',
          password: 'test'
        }).
      end(function(err, res) {
        if (err) {
          return done(err);
        }
        done();
      });
    });

    it('should see daft punk at /artists/429', function(done) {
      Tom.
        get('/artists/429').
      end(function(err, res) {
        should.not.exist(err);
        should.exist(res);
        should.exist(res.body);
        res.should.be.json;
        res.should.have.status(200);
        res.body.should.not.be.empty;
        res.body.Artist.should.equal('Daft Punk');
        res.body.should.be.ok;

        done();
      });
    });

    it('should search at /artist/query', function(done) {
      Tom.
        post('/artists/query').
        send({
          query: 'daft'
        }).
      end(function(err, res) {
        should.not.exist(err);
        should.exist(res);
        should.exist(res.body);
        res.should.be.json;
        res.should.have.status(200);
        res.body.should.be.type('object');
        res.body.should.not.be.empty;

        done();
      });
    });
  });

  describe('dealing with albums', function() {
    var Tom;

    before(function(done) {
      Tom = request.agent(app);
      Tom.post('/users/session').
        send({
          username: 'Tom',
          password: 'test'
        }).
      end(function(err, res) {
        if (err) {
          return done(err);
        }
        done();
      });
    });

    it('should find More Than Just a Dream at /albums/46679', function(done) {
      Tom.
        get('/albums/46679').
      end(function(err, res) {
        should.not.exist(err);
        should.exist(res);
        should.exist(res.body);
        res.should.be.json;
        res.should.have.status(200);
        res.body.Album.should.equal('More Than Just a Dream');
        res.body.Year.should.equal(2013);

        done()
      });
    });

    it('should search at /albums/query', function(done) {
      Tom.
        post('/albums/query').
        send({
          query: 'More'
        }).
      end(function(err, res) {
        should.not.exist(err);
        should.exist(res);
        should.exist(res.body);
        res.should.be.json;
        res.should.have.status(200);
        res.body.should.be.type('object');
        res.body.should.not.be.empty;

        done();
      });

    });

    it('should let me update', function(done) {
      Tom.
        put('/albums/46679').
        send({
          Status: 'Library'
        }).
      end(function(err, res) {
        should.not.exist(err);
        should.exist(res);
        should.exist(res.body);
        res.should.be.json;
        res.should.have.status(200);
        res.body.should.not.be.empty;
        res.body.Album.should.equal('More Than Just a Dream');
        res.body.Status.should.not.equal('OOB');

        done();
      });

    });


  });

  describe('dealing with programs', function() {
    var Tom;

    before(function(done) {
      Tom = request.agent(app);
      Tom.post('/users/session').
        send({
          username: 'Tom',
          password: 'test'
        }).
      end(function(err, res) {
        if (err) {
          return done(err);
        }
        done();
      });
    });

    it('should find a show at /programs/32', function(done) {
      Tom.
        get('/programs/32').
      end(function(err, res) {
        should.not.exist(err);
        should.exist(res);
        should.exist(res.body);
        res.should.be.json;
        res.should.have.status(200);
        res.body.should.not.be.empty;
        res.body.Promocode.should.equal('PROS1418');
        res.body.should.be.ok;

        done();
      });
    });

    it('should let me update', function(done) {
      Tom.
        put('/programs/32').
        send({
          Promocode: 'PROS1418'
        }).
      end(function(err, res) {
        should.not.exist(err);
        should.exist(res);
        should.exist(res.body);
        res.should.be.json;
        res.should.have.status(200);
        res.body.should.not.be.empty;
        res.body.Program.should.equal('Viva le Mock');
        res.body.Promocode.should.not.equal('PROF0818');

        done();
      });
    });
  });

  describe('dealing with playlists', function() {
    var Tom;

    before(function(done) {
      Tom = request.agent(app);
      Tom.post('/users/session').
        send({
          username: 'Tom',
          password: 'test'
        }).
      end(function(err, res) {
        if (err) {
          return done(err);
        }
        done();
      });
    });
    it('should find a VlM playlist at /playlists/21702', function(done) {
      Tom.
        get('/playlists/21702').
      end(function(err, res) {
        should.not.exist(err);
        should.exist(res);
        should.exist(res.body);
        res.should.be.json;
        res.should.have.status(200);
        res.body.should.not.be.empty;
        res.body.UserID.should.equal(168);
        res.body.ProgramID.should.equal(32);
        res.body.Comment.should.equal("The Mock: Testing");

        done();
      });
    });

    it('should let me update', function(done) {
      Tom.
        put('/playlists/21702').
        send({
          Comment: 'The Mock: Testing'
        }).
      end(function(err, res) {
        should.not.exist(err);
        should.exist(res);
        should.exist(res.body);
        res.should.be.json;
        res.should.have.status(200);
        res.body.should.not.be.empty;
        res.body.ProgramID.should.equal(32);
        res.body.Comment.should.equal('The Mock: Testing');
        res.body.should.be.ok;

        done();
      });
    });

  });

});
