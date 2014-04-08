warmdApp.controller("PlaylistCtrl", ["$scope", "$http", "$routeParams", function ($scope, $http, $routeParams) {

  console.log("PlayistCtrl");

  $scope.plays = [];
  $scope.program = {};

  $scope.$watch('plays', function() {
    console.log("CHANGE!!!");
    console.log($scope.plays.map(function(elem){
      return elem.TrackName;
    }))
  }, true);

  $scope.sortableOpts = {
    stop: function(event, ui) {
      console.log("STOP!!!");
      console.log($scope.plays.map(function(elem){
        return elem.TrackName;
      }))
    }
  }


  $http({method: 'GET', url: '/playlists/' + $routeParams.programID + '.json'}).
    success(function(data, status, headers, config) {
      console.log(data);
      $scope.plays = data.plays;
      $scope.program = data.program;
    }).
    error(function(data, status, headers, config) {
      console.log("Loser");
      console.error(data, status, headers, config);
    });



}]);
