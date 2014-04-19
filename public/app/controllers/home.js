warmdApp.controller("HomeCtrl", ["$scope", "$http", function ($scope, $http) {

  console.log("HomeCtrl");

  $scope.showProgram = function(program) {
    return (program.StartTime != program.EndTime);
  };

}]);
