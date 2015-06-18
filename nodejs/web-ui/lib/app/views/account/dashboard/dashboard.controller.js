function dashboardCtrl($scope, $state, $log) {
	$scope.dashboard = {
		map: {
			data: {
				"US": 293,
				"FR": 540,
				"CH": 120,
				"AT": 10,
				"DE": 550,
				"IT": 200,
				"GB": 120
			}
		},

		consumers: [
			{idx: 1, name: 'Landzeit', consumed: 12313412, amount: 'EUR 1239,32.-'},
			{idx: 2, name: 'OMV', consumed: 661312, amount: 'EUR 529,29.-'},
			{idx: 3, name: 'McDonalds', consumed: 123112, amount: 'EUR 421,17.-'},
			{idx: 4, name: 'Moser Medical Group', consumed: 3813, amount: 'EUR 189,15.-'},
			{idx: 5, name: 'VIG (Vienna Insurance Group)', consumed: 3412, amount: 'EUR 139,12.-'}
		]

	};

	$scope.sortableModel = [];
	$scope.sortableOptions = {
		connectWith: ".connectPanels",
		handler: ".ibox-title"
	};

	/* get nav. bar stack */
	$scope.getNavPart = function() {
		return { sref: "index.dashboard", name: "Dashboard" };
	};
	$scope.setNavPath($scope, $state);

}

angular.module('rioxApp').controller('dashboardCtrl', dashboardCtrl);