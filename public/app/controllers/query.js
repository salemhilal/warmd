warmdApp.controller("QueryCtrl", ["$scope", "$http", function QueryCtrl($scope, $http) {
    console.log("QueryCtrl");

    $scope.types = [
      {
        name: "Artists",
        url: "/artists/query",
        format: function(artist) {
          return {
            name: artist.Artist,
            url: "/artists/" + artist.ArtistID,
          };
        }
      },
      {
        name: "Albums",
        url: "/albums/query",
        format: function(album) {
          return {
            name: album.Album,
            sub: album.artist.Artist,
            url: "/albums/" + album.AlbumID,
          };
        }
      },
      {
        name: "Users",
        url: "/users/query",
        format: function(user) {
          return {
            name: user.User,
            url: "/users/" + user.UserID
          };
        }
      },
    ],

    $scope.toQuery = $scope.types[0],
    $scope.$watch('toQuery', function() {
      console.log("ToQuery", $scope.toQuery);
    });

    $scope.selected = function(idx) {
      $scope.toQuery = $scope.types[idx];
    },

    $scope.autocomplete = _.debounce(function(){

      if(!$scope.query || $scope.query.length < 3) {
        return;
      }

      console.log("About to query", $scope.query);

      var url = $scope.toQuery.url;
      var query = $scope.query.trim();
      var format = $scope.toQuery.format;

      $scope.returned = false;
      $http({
          method: "POST",
          url: url,
          data: { query: query }
      }).
        success(function(data, status, headers, config) {
          console.log("found this", data);
          $scope.results = data.map(format).filter(function(item) {

            return item.name.trim() !== "";
          });
        }).
        error(function(data, status, headers, config) {
          console.error(data);
        });

    }, 300);

}]);
