"use strict";

var warmdApp = angular.module('warmdApp', [
  'ngRoute',
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'app/views/main.html',
        controller: 'MainCtrl',
      })
      .when('/query', {
        templateUrl: 'app/views/query.html',
        controller: 'QueryCtrl',
      })
      .when('/login', {
        templateUrl: 'app/views/login.html',
        controller: 'LoginCtrl',
      })
      .otherwise({
        redirectTo: '/'
      })
  });
