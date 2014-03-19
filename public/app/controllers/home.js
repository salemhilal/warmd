warmdApp.controller("HomeCtrl", ["$scope", "$http", function ($scope, $http) {

  console.log("HomeCtrl");
  $scope.programs = $scope.user.programs;

}]);
