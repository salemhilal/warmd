warmdApp.controller("AlbumCtrl", ["$scope", "$http", "$routeParams", function ($scope, $http, $routeParams) {
	console.log("AlbumCtrl");

	console.log($routeParams.albumID);

	$scope.album = {};

	$http({method: 'GET', url: '/albums/' + $routeParams.albumID}).
		success(function(data, status, headers, config) {
			$scope.album = data;
		}).
		error(function(data, status, headers, config) {
			console.error(data);
		});


}]);
