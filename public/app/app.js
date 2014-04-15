"use strict";

var warmdApp = angular.module('warmdApp', [
  'ngRoute', 'ui'
])
.config(function ($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: '/app/views/home.html',
      controller: 'HomeCtrl',
    })
    .when('/query', {
      templateUrl: '/app/views/query.html',
      controller: 'QueryCtrl',
    })
    .when('/login', {
      templateUrl: '/app/views/login.html',
      controller: 'LoginCtrl',
    })
    .when('/user/:id', {
      templateUrl: '/app/views/user.html',
      controller: 'UserCtrl',
    })
    .when('/playlist/new/:programID', {
      templateUrl: '/app/views/playlist.html',
      controller: 'PlaylistCtrl',
    })
    .otherwise({
      redirectTo: '/'
    });
});
