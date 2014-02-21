function QueryCtrl($scope) {
  
  $scope.artists = [];

  $scope.autocomplete = _.debounce(function(){
    $.ajax({
      type: "POST",
      dataType: "json", 
      url: "http://127.0.0.1:3000/artists/query",
      data: {
        query: $scope.query
      }
    }).done(function(data){
      $scope.$apply(function() {
        console.log(data);
        $scope.artists = data;
      });
    });
  }, 200);

}
