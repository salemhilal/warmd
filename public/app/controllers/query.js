warmdApp.controller("QueryCtrl", ["$scope", "$http", function QueryCtrl($scope, $http) {
    console.log("QueryCtrl");

    $scope.types = [
      {
        name: "Artists",
        url: "/artists/query",
        format: function(artist) {
          return {
            name: artist.Artist,
            id: artist.ArtistID,
            url: "/artists/" + artist.ArtistID,
          };
        }
      },
      {
        name: "Users",
        url: "/users/query",
        format: function(user) {
          return {
            name: user.User,
            id: user.UserID,
            url: "/users/" + user.UserID
          };
        }
      },
    ],

    $scope.toQuery = $scope.types[0],

    $scope.selected = function(idx) {
      $scope.toQuery = $scope.types[idx];
    },

    $scope.autocomplete = _.debounce(function(){
      if(!$scope.query || $scope.query.length < 3) {
        return;
      }

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
