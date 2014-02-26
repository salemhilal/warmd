warmdApp.controller("MainCtrl", ["$scope", function MainCtrl($scope){
    // Because templating is easier than html
    $scope.menu = [
        { name: "My info" },
        { name: "Shows" },
        { name: "Log out" },
        { name: "Help" },
        { name: "Home" },
    ]
}]);
