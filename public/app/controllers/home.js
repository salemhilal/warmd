/* globals warmdApp */
"use strict";

warmdApp.controller("HomeCtrl", ["$scope", "$http", function ($scope, $http) {

  console.log("HomeCtrl");

  $scope.showProgram = function(program) {
    return (program.StartTime != program.EndTime);
  };

  $scope.getProgramTime = function(program) {
    var daysOfTheWeek = ["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"];

    var start = new Date(program.StartTime);
    // var end = new Date(program.endTime);

    return daysOfTheWeek[start.getDay()] + " at " + start.toLocaleTimeString();
  };

}]);
