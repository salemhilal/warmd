
var request = require('request'),
    vows = require('vows'),
    assert = require('assert'),
    apiUrl = "https://127.0.0.1:3000",
    cookie = null;


var apiTest = {
  general: function( method, url, data, cb ){
    //console.log( 'cb?', cb )
    request(
      {
        method: method,
        url: apiUrl+(url||''),
        json: data || {},
        headers: {Cookie: cookie}
      },
      function(error, response, body){
        cb( error, response, body )
      }
    )
  },
  get: function( url, data, cb  ){ apiTest.general( "GET", url, data, cb    )  },
  post: function( url, data, cb ){ apiTest.general( 'POST', url, data, cb   )  },
  put: function( url, data, cb  ){ apiTest.general( 'PUT', url, data, cb    )  },
  del: function( url, data, cb  ){ apiTest.general( 'DELETE', url, data, cb )  }
}

function assertStatus(code) {
  return function (e, res) {
    assert.equal(res.status, code);
  };
}


function assertJSONHead(){
  return function(error, res, body){
    assert.equal( res.headers['content-type'], 'application/json; charset=utf-8' )
  }
}

function assertValidJSON(){
  return function(error, res, body){
    // this can either be a Object or Array
    assert.typeof(body,'Object' || 'Array' )
  }
}

var suite = vows.describe('API Localhost Authenticated Tests')

// Very first test!
.addBatch({
  "Server should be responding": {
    topic: function(){
      request.get('https://127.0.0.7:3000/ping',this.callback);
    },

    '/ping should respond pong' : function(error, res, body){
      console.log(res);
      assert.ok(body)

    }
  }
})

.addBatch({
  'Authenticate to /login': {
    topic: function(){
      request.post("https://127.0.0.1:3000/user/session",
        this.callback
      ).form({username: 'mcbaron', password: 'bacon'});
    },

    'get a valid Cookie': function(error, res, body){
      try{
        cookie = res.headers['set-cookie'].pop().split(';')[0]
        console.log("GOT COOKIE!", cookie)
      } catch(error){ }

      assert.ok( typeof(cookie) == 'string' && cookie.length > 10 )
    }
  }
})
.addBatch({
  'Pronobozo Ze1eE': {
    topic: function(){
      apiTest.get('/app/#/albums/42176', {}, this.callback)
    },
    'should be 200': assertStatus(200),
    'should have JSON header' : assertJSONHead(),
    'body is valid JSON' : assertValidJSON(),

  },
})
.addBatch({
  'Search': {
    topic: function(){
      apiTest.get('/app/#/query', {}, this.callback)
    },
    'should be 200': assertStatus(200),
    'should have JSON header' : assertJSONHead(),
    'body is valid JSON' : assertValidJSON(),

  },
})

.export( module )
