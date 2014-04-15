var acl = require('acl');

acl = new acl(new acl.memoryBackend());

acl.allow([{
  roles: ['None'],
  allows: [{
    resources: ['/playlists', '/programs'],
    permissions: 'get'
  }]
}, {
  roles: ['Trainee'],
  allows: [{
    resources: ['/albums', '/artists', '/plays', '/playlists', '/programs', '/users'],
    permissions: 'get'
  }, {
    resources: ['/albums', '/artists', '/users'],
    permissions: 'put'
  }]
}, {
  roles: ['User'],
  allows: [{
    resources: ['/albums', '/artists', '/plays', '/playlists', '/programs', '/users'],
    permissions: ['get', 'put']
  }, {
    resources: ['/albums', '/artists'],
    permissions: 'post'
  }, {
    resources: ['/plays', '/playlists'],
    permissions: 'delete'
  }]
}, {
  roles: ['Exec'],
  allows: [{
    resources: ['/albums', '/artists', '/plays', '/playlists', '/programs', '/users'],
    permissions: ['get', 'put', 'post']
  }, {
    resources: ['/plays', '/playlists'],
    permissions: 'delete'
  }]
}, {
  roles: ['Admin'],
  allows: [{
    resources: ['/albums', '/artists', '/plays', '/playlists', '/programs', '/users'],
    permissions: '*'
  }]
}]);

exports.acl = acl;
