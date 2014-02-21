"use strict";

var warmdApp = angular.module('warmdApp', [
  'ngRoute',
  'warmdControllers',
  'warmdServices'  
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/' {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      })
  });
