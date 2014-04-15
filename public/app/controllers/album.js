warmdApp.controller("AlbumCtrl", ["$scope", "$http", "$routeParams", function ($scope, $http, $routeParams) {
	console.log("AlbumCtrl");

	console.log($routeParams.albumID);

	$scope.album = {};
	$scope.statuses = [
		"Bin",
		"Library",
		"Missing",
		"N&WC",
		"NBNB",
		"NIB",
		"OOB",
		"TBR",
	]

	// Watch album for changes
	$scope.$watch('album', function(){

	});

	$http({method: 'GET', url: '/albums/' + $routeParams.albumID}).
		success(function(data) {
			$scope.album = data;

			$http({
				method: 'GET',
				url: '/cover?artist=' + data.artist.Artist + "&album=" + data.Album
			}).
				success(function(data) {
					if(data.resultCount > 0) {
						$scope.cover = data.results[0].artworkUrl100.replace("100x100", "600x600");
					}
				});

			console.log("Album data", $scope.album);
		}).
		error(function(data, status, headers, config) {
			console.error(data);
		});


}]);
