"use strict";
/* Test all sorts of user endpoints */

/* global describe, it */

var should = require('should'),
    request = require('supertest'),
    app = require('../server'),
    context = describe;

var user, pass;

describe('Users', function() {
      describe('Authentication', function() {

         it('should log in successfully', function(done) {
            request.agent(app).
            post('/users/session').
            send({ username: 'Tom', password: 'test' }).
            end(function(err, res){
               // Catch any errors
               if (err) { return done(err); }

               // Make sure login was successful
               res.should.have.status(302);
               res.should.have.header('location', '/app');
               done();
               });
            });

         it('should not log in invalid users', function(done) {
            request.agent(app).
            post('/users/session').
            send({ username: 'not_a_username', password: 'not_a_password' }).
            end(function(err, res) {
               // Catch any errors
               if (err) { return done(err); }

               // Make sure login wasn't successful
               res.should.have.status(302);
               res.should.have.header('location', '/login?success=false');
               done();
               });
            });
      });
});
