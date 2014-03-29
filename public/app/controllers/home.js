warmdApp.controller("HomeCtrl", ["$scope", "$http", function ($scope, $http) {

  console.log("HomeCtrl");
  console.log($scope.user);
  $scope.programs = $scope.user.programs;

  $scope.showProgram = function(program) {
    return !(program.StartTime == program.EndTime);
  }

}]);
