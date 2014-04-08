warmdApp.controller("PlaylistCtrl", ["$scope", "$http", "$routeParams", function ($scope, $http, $routeParams) {

  console.log("PlayistCtrl");
  console.log($routeParams.programID);
  console.log($scope.user);
  $scope.programID = $routeParams.programID;

  // TODO: Just to prototype
  $scope.plays = ["one", "two", "three", "four", "five", "six"];


  $http({method: 'GET', url: '/playlists/' + $routeParams.programID + '.json'}).
    success(function(data, status, headers, config) {
      console.log("Winner");
      console.log(data, status, headers, config);
    }).
    error(function(data, status, headers, config) {
      console.log("Loser");
      console.error(data, status, headers, config);
    });

}]);
