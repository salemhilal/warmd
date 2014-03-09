warmdApp.controller("QueryCtrl", ["$scope", function QueryCtrl($scope) {
    console.log("QueryCtrl")

    $scope.artists = [];

    $scope.autocomplete = _.debounce(function(){
      $.ajax({
        type: "POST",
        dataType: "json",
        url: "/artists/query",
        data: {
          query: $scope.query
        }
      }).done(function(data){
        if(data.error) {
            console.error(data);
            return;
        }

        $scope.$apply(function() {
          $scope.artists = data.filter(function(artist) {
            return artist.Artist.trim() != "";
          });
        });
      });
    }, 200);

}]);
