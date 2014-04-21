warmdApp.controller("PlaylistCtrl", ["$scope", "$http", "$routeParams", function ($scope, $http, $routeParams) {

  console.log("PlayistCtrl");

  $scope.plays = [];
  $scope.program = {};
  $scope.playlist = {};
  $scope.state = 0;

  $scope.newArtist = {}; // query, results, selection
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

  // Helper function for formatting dates
  $scope.formatDate = function(str) {
    return new Date(str).toLocaleDateString();
  };

  // Formats times properly
  $scope.formatTime = function(str) {
    // TODO: Do something smarter to peel off the seconds
    return new Date(str).toLocaleTimeString().replace(":00 ", " ");
  };

  // Watch for new artists
  $scope.$watch('newArtist.query', _.debounce(function() {
    console.log("CHANGE");

    // Ignore useless queries
    if(!$scope.newArtist.query || $scope.newArtist.query.length < 2) {
      $scope.$apply(function(){
        $scope.newArtist.results = [];
      });
      return;
    }

    // If they type in a short query, they better mean it.
    var data = { query: $scope.newArtist.query };
    if($scope.newArtist.query.length < 4) {
      data.limit = 20;
    }

    // Make the request, update the scope with the results.
    $http({
      method: "POST",
      url: "/artists/query",
      data: data,
    }).
      success(function(data) {
        $scope.newArtist.results = data;
      }).
      error(function(err) {
        console.error(err);
      });

  }, 300));

  // We've selected an artist!
  $scope.submitArtist = function(artist) {
    $scope.newArtist.selection = artist;

    // Did they pick an artist in the db or what?
    if(typeof artist === "object") {
      $scope.newAlbum.results = artist.albums;
    } else {
      $scope.newAlbum.results = [];
    }

    // Update the state
    $scope.state = 1;

  };

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

  // Load playlist data from the server
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
