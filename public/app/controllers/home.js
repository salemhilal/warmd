/* globals warmdApp */
"use strict";

warmdApp.controller("HomeCtrl", ["$scope", "$http", "$location", function($scope, $http, $location) {

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

    $scope.createPlaylist = function(program) {
      // Program start and end times.
      var start = new Date(program.StartTime);
      var end = new Date(program.EndTime);

      var today = new Date();
      var newStart, newEnd;
      // There's a show today
      if (today.getDay() == start.getDay()) {
        // If we're past the end of the show, use next week.
        newStart = new Date();
        newStart.setHours(start.getHours()); newStart.setMinutes(start.getMinutes()); newStart.setSeconds(0);
        newEnd = new Date(newStart.getTime() + (end.getTime() - start.getTime()));

      } else {
        // Use next occurrance
        newStart = nextDay(start.getDay());
        newEnd = new Date(newStart.getTime() + (end.getTime() - start.getTime()));
      }

      var playlist = {
        startTime: newStart,
        endTime: newEnd,
        userID: $scope.user.UserID,
        comment: "",
        programID: program ? program.ProgramID : ""
      };

      $http.post('/playlists', playlist).
        success(function(data) {
          console.log("Created a playlist:", data);
          $location.path('/playlists/' + data.PlayListID);
        }).
      error(function(err) {
        console.error(err);
      });

    };


    // Given day of week, finds next day of week from @date, which defaults to today.
    function nextDay(dayOfWeek, date) {
      var ret = new Date(date || new Date());
      var day = dayOfWeek || 0;
      ret.setDate(ret.getDate() + (day - 1 - ret.getDay() + 7) % 7 + 1);
      return ret;
    }

  }]);
