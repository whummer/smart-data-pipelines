function footerCtrl($scope, $interval) {
	$interval(function () {
		$scope.consumerCounter = getRandomInt(38000, 40000);
		$scope.providerCounter = getRandomInt(2800, 2805);
	}, 1000);
};

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

angular.module('rioxApp').controller(footerCtrl);