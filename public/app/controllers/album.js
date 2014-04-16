warmdApp.controller("AlbumCtrl", ["$scope", "$http", "$routeParams", function ($scope, $http, $routeParams) {
	console.log("AlbumCtrl");

	console.log($routeParams.albumID);

	$scope.statuses = [
		"Bin",
		"Library",
		"Missing",
		"N&WC",
		"NBNB",
		"NIB",
		"OOB",
		"TBR",
	];

	// Watch album for changes
	$scope.$watch('album', function(){
		if(!$scope.album){
			return;
		}

		$http({
			method: 'PUT',
			url: '/albums/' + $routeParams.albumID,
			data: $scope.album
		}).
			success(function(data) {
				console.log(data);
			}).
			error(function(data) {
				console.error(data);
			});
	}, true);


	$scope.formatDate = function(str) {
		return new Date(str).toLocaleDateString();
	};


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
