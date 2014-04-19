warmdApp.controller("ArtistCtrl", ["$scope", "$http", "$routeParams", function ($scope, $http, $routeParams) {

	console.log("ArtistCtrl");

	$scope.artist = {};

	$http({method: 'GET', url: '/artists/' + $routeParams.artistID}).
		success(function(data, status, headers, config) {
			console.log(data);
			$scope.artist = data;


			// Get album art for each of them
			angular.forEach($scope.artist.albums, function(album) {
				$http({method: 'GET', url: '/cover?artist=' + $scope.artist.Artist + "&album=" + album.Album}).
					success(function(data, status, headers, config) {
						if(data.resultCount > 0) {
							album.cover = data.results[0].artworkUrl100.replace("100x100", "600x600");
						}
					});
			});


		}).
		error(function(data, status, headers, config) {
			console.error(data);
		});
}]);
