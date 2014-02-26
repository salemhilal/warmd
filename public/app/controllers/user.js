warmdApp.controller("UserCtrl", ["$scope", "$routeParams", function($scope, $routeParams) {

    $scope.user = {}
    $scope.params = $routeParams

    $.getJSON("/users/" + $scope.params.id, function(user) {
        console.log(user);

        $scope.$apply(function() {
            $scope.user = user;
        });
    })
}]);
