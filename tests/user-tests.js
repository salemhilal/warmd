"use strict";
/* Test all sorts of user endpoints */

/* global describe, it */

var should = require('should'),
    request = require('supertest'),
    app = require('../server'),
    context = describe;

describe('Users', function() {
      describe('Authentication', function() {

         it('should log in successfully', function(done) {
            request.agent(app).
            post('/users/session').
            send({ username: 'shilal', password: 'mustache' }).
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



/* THIS IS HOW TO TEST LOGINS

   var request = require('superagent');
   var user1 = request.agent();
   user1
   .post('http://localhost:4000/signin')
   .send({ user: 'hunter@hunterloftis.com', password: 'password' })
   .end(function(err, res) {
// user1 will manage its own cookies
// res.redirects contains an Array of redirects
});
*/
