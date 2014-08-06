'use strict';

var warmdApp = angular.module('warmdApp', [
  'ngRoute', 'ui.sortable'
]).
config(function($routeProvider) {
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
      if (program.isActive) {
        filtered.push(program);
      }
    });
    return filtered;
  };
}).
// Click to edit!
directive("clickToEdit", function() {
  var editorTemplate = '<div class="click-to-edit">' +
      '<div ng-hide="view.editorEnabled">' +
        '<span ng-click="enableEditor()" class="fui-new" style="margin-right:10px; font-size:.9em; color:#bdc3c7"></span>' +
        '<strong>{{label}}:&nbsp;&nbsp;</strong>' +
        '<span ng-show="value">{{value}}</span>' +
        '<em ng-hide="value">none</em>' +
      '</div>' +
      '<form class="form-inline" ng-show="view.editorEnabled" style="margin-top: 10px">' +
        '<input type="text" class="form-control" ng-model="view.editableValue" style="margin-right:5px;" placeholder="{{label}}">' +
        '<div class="btn-group">' +
          '<button type="button" class="btn btn-inverse" ng-click="save()"><span class="fui-check"></span></button>' +
          '<button type="button" class="btn btn-default" ng-click="disableEditor()"><span class="fui-cross"></span></button>' +
        '</div>' +
      '</form>' +
    '</div>';

  return {
    restrict: "A",
    replace: true,
    template: editorTemplate,
    scope: {
      value: "=clickToEdit",
      label: "@editLabel",
    },
    controller: function($scope) {
      $scope.view = {
        editableValue: $scope.value,
        editorEnabled: false
      };

      $scope.enableEditor = function() {
        $scope.view.editorEnabled = true;
        $scope.view.editableValue = $scope.value;
      };

      $scope.disableEditor = function() {
        $scope.view.editorEnabled = false;
      };

      $scope.save = function() {
        $scope.value = $scope.view.editableValue;
        $scope.disableEditor();
      };
    }
  };
}).
// Click to edit date!
directive("clickToEditDate", function() {
  var editorTemplate = '<div class="click-to-edit">' +
      '<div ng-hide="view.editorEnabled">' +
        '<span ng-click="enableEditor()" class="fui-new" style="margin-right:10px; font-size:.9em; color:#bdc3c7"></span>' +
        '<strong>{{label}}:&nbsp;&nbsp;</strong>' +
        '<span ng-show="value">{{value | date: "MM/dd/yy"}}</span>' +
        '<em ng-hide="value">none</em>' +
      '</div>' +
      '<form class="form-inline" ng-show="view.editorEnabled" style="margin-top: 10px">' +
        '<input type="date" class="form-control" ng-model="view.editableValue" style="margin-right:5px;" placeholder="{{label}}">' +
        '<div class="btn-group">' +
          '<button type="button" class="btn btn-inverse" ng-click="save()"><span class="fui-check"></span></button>' +
          '<button type="button" class="btn btn-default" ng-click="disableEditor()"><span class="fui-cross"></span></button>' +
        '</div>' +
      '</form>' +
    '</div>';

  return {
    restrict: "A",
    replace: true,
    template: editorTemplate,
    scope: {
      value: "=clickToEditDate",
      label: "@editLabel",
    },
    controller: function($scope) {
      $scope.view = {
        editableValue: $scope.value,
        editorEnabled: false
      };

      $scope.enableEditor = function() {
        $scope.view.editorEnabled = true;
        $scope.view.editableValue = $scope.value;
      };

      $scope.disableEditor = function() {
        $scope.view.editorEnabled = false;
      };

      $scope.save = function() {
        $scope.value = $scope.view.editableValue;
        $scope.disableEditor();
      };
    }
  };
}).
// Click to select!
directive("clickToSelect", function() {
  var editorTemplate = '<div class="click-to-edit">' +
      '<div ng-hide="view.editorEnabled">' +
        '<span ng-click="enableEditor()" class="fui-new" style="margin-right:10px; font-size:.9em; color:#bdc3c7"></span>' +
        '<strong>{{label}}:&nbsp;&nbsp;</strong>' +
        '<span ng-show="value">{{value}}</span>' +
        '<em ng-hide="value">none</em>' +
      '</div>' +
      '<form class="form-inline" ng-show="view.editorEnabled" style="margin-top: 10px">' +
        '<select class="form-control" style="margin-right:5px;" ng-model="view.editableValue" ng-select="select in selections">' +
          '<option ng-repeat="select in selections">{{select}}</option>' +
        '</select>' +
        '<div class="btn-group">' +
          '<button type="button" class="btn btn-inverse" ng-click="save()"><span class="fui-check"></span></button>' +
          '<button type="button" class="btn btn-default" ng-click="disableEditor()"><span class="fui-cross"></span></button>' +
        '</div>' +
      '</form>' +
    '</div>';

  return {
    restrict: "A",
    replace: true,
    template: editorTemplate,
    scope: {
      value: "=clickToSelect",
      label: "@editLabel",
      selections: "=editSelections"
    },
    controller: function($scope) {
      $scope.view = {
        editableValue: $scope.value,
        editorEnabled: false
      };

      $scope.enableEditor = function() {
        $scope.view.editorEnabled = true;
        $scope.view.editableValue = $scope.value;
      };

      $scope.disableEditor = function() {
        $scope.view.editorEnabled = false;
      };

      $scope.save = function() {
        $scope.value = $scope.view.editableValue;
        $scope.disableEditor();
      };
    }
  };
});
