warmdApp.controller("AlbumCtrl", ["$scope", "$http", "$routeParams", function ($scope, $http, $routeParams) {
	console.log("AlbumCtrl");

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

	$scope.dateAdded = new Date(2013, 9, 20);

	// Watch album for changes
	$scope.$watch('album', function(){
		if(!$scope.album){
			return;
		}
		// $scope.album.DateAdded = $scope.dateAdded.toISOString().slice(0, 19).replace('T', ' ');
		// $scope.album.DateRemoved = $scope.dateRemoved.toISOString().slice(0, 19).replace('T', ' ');

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
			var add = new Date(data.DateAdded);
			// $scope.dateAdded = new Date(add.getFullYear(), add.getMonth(), add.getDate());

			$http({
				method: 'GET',
				url: '/albums/cover?artist=' + data.artist.Artist + "&album=" + data.Album
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
