"use strict";

var warmdApp = angular.module('warmdApp', [
  'ngRoute', 'ui.sortable'
]).
config(function ($routeProvider) {
  $routeProvider.
    when('/', {
      templateUrl: '/app/views/home.html',
      controller: 'HomeCtrl',
    }).
    when('/query', {
      templateUrl: '/app/views/query.html',
      controller: 'QueryCtrl',
    }).
    when('/login', {
      templateUrl: '/app/views/login.html',
      controller: 'LoginCtrl',
    }).
    when('/users/:id', {
      templateUrl: '/app/views/user.html',
      controller: 'UserCtrl',
    }).
    when('/playlists/:playlistID', {
      templateUrl: '/app/views/playlist.html',
      controller: 'PlaylistCtrl',
    }).
    when('/programs/:programID', {
      templateUrl: '/app/views/program.html',
      controller: 'ProgramCtrl',
    }).
    when('/artists/:artistID', {
      templateUrl: '/app/views/artist.html',
      controller: 'ArtistCtrl',
    }).
    when('/albums/:albumID', {
      templateUrl: '/app/views/album.html',
      controller: 'AlbumCtrl',
    }).
    otherwise({
      redirectTo: '/'
    });
}).
// This bit here is for removing shows that are "hidden," in the old db.
filter('activePrograms', function() {
  return function(programs) {
    var filtered = [];
    angular.forEach(programs, function(program) {
        if(program.StartTime != program.EndTime) {
          filtered.push(program);
        }
    });
    return filtered;
  };
});
