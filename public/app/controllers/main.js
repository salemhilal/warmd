warmdApp.controller("MainCtrl", ["$scope", "$http", function MainCtrl($scope, $http){
    // Because templating is easier than html
    $scope.menu = [
        { name: "My info", url: "/logout" },
        { name: "Shows",   url: "#"},
        { name: "Log out", url: "#" },
        { name: "Help",    url: "#" },
        { name: "Home",    url: "#" },
    ]

    $scope.user = {};

    // Populate the page with data
    $http({method: 'GET', url: '/me'}).
      success(function(data, status, headers, config) {
        $scope.user = data;
      }).
      error(function(data, status, headers, config) {
        // TODO: Display a "DB is down lol" page here.
        console.error(data, status, headers, config);
      });

}]);
