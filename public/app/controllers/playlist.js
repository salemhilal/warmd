warmdApp.controller("PlaylistCtrl", ["$scope", "$routeParams", function ($scope, $routeParams) {

  console.log("PlayistCtrl");
  console.log($routeParams.programID);
  console.log($scope.user);
  $scope.programID = $routeParams.programID;

  // TODO: Just to prototype
  $scope.plays = ["one", "two", "three", "four", "five", "six"];


}]);
