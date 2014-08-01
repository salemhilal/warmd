warmdApp.controller("MainCtrl", ["$scope", "$http", "$location", function MainCtrl($scope, $http, $location) {

    // Because templating is easier than html
    $scope.menu = [
      {
        name: "Home",
        prefix: "#",
        route: "/"
      },
      {
        name: "Search",
        prefix: "#",
        route: "/query"
      },
      {
        name: "Log out",
        prefix: "",
        route: "/logout"
      },
    ];

    $scope.isActive = function(location) {
      return location === $location.path();
    };

    $scope.user = {};

    // Populate the page with data
    $http({
      method: 'GET',
      url: '/me'
    }).
    success(function(data, status, headers, config) {
      console.log(data);
      $scope.user = data;
    }).
    error(function(data, status, headers, config) {
      // TODO: Display a "DB is down lol" page here.
      console.error(data, status, headers, config);
    });

    // Were we supposed to go somewhere?
    var goto = localStorage.getItem("warmd_goto_url");
    if (goto) {
      // Get rid of the redirection in localStorage
      localStorage.removeItem("warmd_goto_url");
      // Go to where you should have gone
      $location.path(goto);
    }
  }]);
