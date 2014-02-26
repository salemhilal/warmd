"use strict";

var warmdApp = angular.module('warmdApp', [
  'ngRoute',
])
.config(function ($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'app/views/home.html',
      controller: 'HomeCtrl',
    })
    .when('/query', {
      templateUrl: 'app/views/query.html',
      controller: 'QueryCtrl',
    })
    .when('/login', {
      templateUrl: 'app/views/login.html',
      controller: 'LoginCtrl',
    })
    .when('/user/:id', {
      templateUrl: 'app/views/user.html',
      controller: 'UserCtrl',
    })
    .otherwise({
      redirectTo: '/'
    })
});
