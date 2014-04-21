// Api endpoint tests
//  Simple setup, make sure that things return JSON, exist (not 404), etc.
//
var vows = require('vows'),
    assert = require('assert');

//var app = ;

var api = {
get: function(path) {
        return function () {
           client.get(path, this.callback);
        };
     }
};

function assertStatus(code) {
//
// Send a request and check the response status.
//
function respondsWith(status) {
   var context = {
      topic: function () {
          // Get the current context's name, such as "POST /"
          // and split it at the space.
          var req    = this.context.name.split(/ +/), // ["POST", "/"]
          method = req[0].toLowerCase(),          // "post"
          path   = req[1];                        // "/"

          // Perform the contextual client request,
          // with the above method and path.
          client[method](path, this.callback);
       }
   };
   // Create and assign the vow to the context.
   // The description is generated from the expected status code
   // and status name, from node's http module.
   context['should respond with a ' + status + ' '
      + http.STATUS_CODES[status]] = assertStatus(status);

   return context;
}

/*
{ topic: api.get ('/app'),
   ' should respond with 200 OK': assertStatus(200)
}
*/

{  'GET /app':    respondsWith(200),
   'GET /login':  respondsWith(200),
   'GET /query':  respondsWith(403),
}

