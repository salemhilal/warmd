
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
      function(req, res){
        cb( res );
      }
    );
  },
  get: function( url, data, cb  ){ apiTest.general( 'GET', url, data, cb    ) ; },
  post: function( url, data, cb ){ apiTest.general( 'POST', url, data, cb   ) ; },
  put: function( url, data, cb  ){ apiTest.general( 'PUT', url, data, cb    ) ; },
  del: function( url, data, cb  ){ apiTest.general( 'DELETE', url, data, cb ) ; }
};

function assertStatus(code) {
  return function (res, b, c) {
    assert.equal(res.statusCode, code);
  };
}


function assertJSONHead(){
  return function(res, b, c ){
    assert.equal( res.headers['content-type'], 'application/json; charset=utf-8' );
  };
}

function assertValidJSON(){
  return function(res, b ){
    // this can either be a Object or Array
    assert.ok( typeof(res.body) == 'object' );
  };
}

var suite = vows.describe('API Localhost Authenticated Tests')

// Very first test!
.addBatch({
  "Server should be responding": {
    topic: function(){
      apiTest.get('/ping', {} ,this.callback );
    },

    '/ping should repond pong' : function(res, b){
      console.log("HERE'S B", b);
      assert.ok(res.body);

    }
  }
})

.addBatch({
  'Authenticate to /login': {
    topic: function(){
      request.post(
        {
          url: "https://127.0.0.1:3000/user/session",
          json: {  username: 'mcbaron', password: 'notMyPassword' }
        },
        this.callback
      );
    },



    'get a valid Cookie': function(req, res, body, err){
      try{
        cookie = res.headers['set-cookie'].pop().split(';')[0];
        console.log("GOT COOKIE!", cookie);
      } catch(e){ }

      assert.ok( typeof(cookie) == 'string' && cookie.length > 10 );
    }
  }
})
.addBatch({
  'Pronobozo Ze1eE': {
    topic: function(){
      apiTest.get('app/#/albums/42176', {}, this.callback);
    },
    'should be 200': assertStatus(200),
    'should have JSON header' : assertJSONHead(),
    'body is valid JSON' : assertValidJSON(),

  },
})
.addBatch({
  'Search': {
    topic: function(){
      apiTest.get('app/#/query', {}, this.callback);
    },
    'should be 200': assertStatus(200),
    'should have JSON header' : assertJSONHead(),
    'body is valid JSON' : assertValidJSON(),

  },
});

suite.export( module );
