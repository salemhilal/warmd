"use strict";
/* Test all sorts of user endpoints */

/* global describe, it, before */

var should = require('should'),
		request = require('supertest'),
		app = require('../server'),
		context = describe;


			describe('Endpoints', function() {

						var Tom;

						before(function(done) {
							Tom = request.agent(app);
							Tom.post('/users/session').
							send({ username: 'Tom', password: 'test' }).
							end(function(err, res) {
									if (err) { return done(err); }
									done();
									});
							});

						it('should see mcbaron at 571', function (done) {
							Tom.
							get('/users/571').
							end(function(err, res){
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

						it('should find an array of "Matt\'s"', function (done) {
									Tom.
									post('/users/query').
									send({query:'matt'}).
									end(function(err, res){
										should.not.exist(err);
										should.exist(res);
										should.exist(res.body);
										res.should.be.json;
										res.should.have.status(200);
										res.body.should.be.type('object');
										res.body.should.be.an.instanceOf(Array);
										res.body.should.not.be.empty;
										res.body.should.containDeep([{User: 'msiko'}]);

										done();
										});
									});
			});
