warmdApp.controller("PlaylistCtrl", ["$scope", "$http", "$routeParams", function ($scope, $http, $routeParams) {

  console.log("PlayistCtrl");

  $scope.plays = [];
  $scope.program = {};


  $scope.$watch('plays', function() {
    console.log('HERE LOOK', $scope.plays)
    angular.forEach($scope.plays, function(play, index) {

      $http({
        method: 'PUT',
        url: '/plays/' + play.PlayID,
        data: {
          Ordering: index
        }
      }).
        success(function(data) {
          console.log(data);
        }).
        error(function(data) {
          console.error("ERROR UPDATING ORDERING:", data);
        })


    });
  }, true);


  $http({method: 'GET', url: '/playlists/' + $routeParams.playlistID}).
    success(function(data, status, headers, config) {
      console.log(data);
      // Update the program data
      $scope.program = data.program;

      // Check to see if all plays have an ordering
      var hasOrdering = true
      pub = data.plays
      for(i in data.plays) {
        if(!data.plays[i].Ordering) {
          hasOrdering = false;
          break;
        }
      }

      // Sort accordingly
      if(!hasOrdering) {
        $scope.plays = data.plays.sort(function(a, b) {
          return new Date(a.Time).getTime() - new Date(b.Time).getTime();
        });
      } else {
        $scope.plays = data.plays.sort(function(a, b) {
          return a.Ordering - b.Ordering
        });
      }
    }).
    error(function(data, status, headers, config) {
      console.log("Error occurred:");
      console.error(data, status, headers, config);
    });



}]);
