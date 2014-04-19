warmdApp.controller("ProgramCtrl", ["$scope", "$http", "$routeParams", function ($scope, $http, $routeParams) {

	console.log("ProgramCtrl");

	$scope.program = {};
	$scope.playlists = [];

	$scope.formatDate = function(str) {
		var t = new Date(str);
		return t.toLocaleDateString();
	};

	$scope.day = function() {
		var day = new Date($scope.program.StartTime).getDay();
		return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day];
	};

	$scope.time = function() {
		var time = new Date($scope.program.StartTime).getHours();
		var pm = (time >= 12 && time < 24)? 'pm' : 'am';
		if (time > 12) {
			time -= 12;
		}
		if (time === 0) {
			time = 12;
		}

		return time + " " + pm;
	};

	$scope.duration = function() {
		var start = new Date($scope.program.StartTime);
		var end = new Date($scope.program.EndTime);

		var dur = (end - start) / (60 * 60 * 1000) + "";
		var ending = (dur == 1 ? "hour" : "hours");
		return dur + " " + ending + " long";
	};

	$http({method: 'GET', url: '/programs/'+ $routeParams.programID}).
		success(function(data, status, headers, config) {
			console.log(data);
			$scope.program = data;
			$scope.playlists = data.playlists;
		});

}]);
