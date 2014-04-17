warmdApp.controller("PlaylistCtrl", ["$scope", "$http", "$routeParams", function ($scope, $http, $routeParams) {

  console.log("PlayistCtrl");

  $scope.plays = [];
  $scope.program = {};
  $scope.playlist = {};
  $scope.state = 0;

  $scope.newArtist = {};
  $scope.newAlbum = {};
  $scope.newTrack = {};


  $scope.$watch('plays', function() {
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
        });


    });
  }, true);

  // WATCH FOR NEW ARTISTS
  $scope.$watch('newArtist.query', _.debounce(function() {
    if(!$scope.newArtist.query || $scope.newArtist.query.length < 3) {
      return;
    }

    console.log("About to query", $scope.newArtist.query);

    $http({
      method: "POST",
      url: "/artists/query",
      data: {query: $scope.newArtist.query},
    }).
      success(function(data) {
        if(data.length === 0){
          return;
        }

        $scope.newArtist.results = data;
        $scope.newArtist.results[0].active = true;
      }).
      error(function(err) {
        console.error(err);
      });

  }, 300));

  // On "Submit", run this
  $scope.addPlay = function() {
    $http({
      method: 'POST',
      url: '/plays',
      data: {
        time: new Date().toISOString().slice(0, 19).replace('T', ' '),
        playListID: $scope.playlist.PlayListID,
        artistID: 1, // TODO: NOT THIS PLEASE EVER
        albumID: 1,
        trackName: $scope.track,
        Mark: false, B: false, R: false, // TODO: Do bin cut stuff
        ordering: $scope.plays.length,
      }
    }).
      success(function(data) {
        console.log(data);
        $scope.plays.push(data);
      }).
      error(function(data) {
        console.error(data);
      });
  };

  $http({method: 'GET', url: '/playlists/' + $routeParams.playlistID}).
    success(function(data, status, headers, config) {
      console.log(data);
      // Update the program data
      $scope.playlist = data;
      $scope.program = data.program;

      // Check to see if all plays have an ordering
      var hasOrdering = true;
      pub = data.plays;
      for(var i in data.plays) {
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
          return a.Ordering - b.Ordering;
        });
      }
    }).
    error(function(data, status, headers, config) {
      console.log("Error occurred:");
      console.error(data, status, headers, config);
    });



}]);
