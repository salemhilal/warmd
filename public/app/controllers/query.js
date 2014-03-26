warmdApp.controller("QueryCtrl", ["$scope", function QueryCtrl($scope) {
    console.log("QueryCtrl");

    $scope.types = [
      {
        name: "Artists",
        url: "/artists/query",

      }
    ]

    $scope.results = [];
    $scope.toQuery = $scope.types[0];



    // TODO: use $http
    // TODO: Limit query to ten.
    $scope.autocomplete = _.debounce(function(){
      $http({ method: "POST", url: $scope.toQuery.url, data: { query: $scope.query.trim() } }).
        success(function(data, status, headers, config) {
          $scope.results = data.filter(function(artist) {
            return artist.Artist.trim() != "";
          });
        }).
        error(function(data, status, headers, config) {
          console.error(data);
        });

    }, 200);

}]);
