function dashboardCtrl($scope, $state, $log) {

	/* constants/configs */
	var MAX_LENGTH_ALL = 200;
	var MAX_LENGTH = 20;
	$scope.intervals = 
		[
		 {value: 1000, label: "1 sec"},
		 {value: 2000, label: "2 sec"}, 
		 {value: 5000, label: "5 sec"}, 
		 {value: 10000, label: "10 sec"}
		];

	/* chart config */
	$scope.chart = {};
	$scope.chart.series = ['Series A', 'Series B'];
	$scope.chart.data = [[],[]];
	$scope.chart.dataAll = [[],[]];
	$scope.chart.labels = [];
	$scope.chart.labelsAll = [];
	$scope.chart.options = {
			animation : false
	};
	$scope.chart.update = true;
	$scope.chart.interval = 2000;
	
	/* stats hash */
	$scope.stats = {
			requests: {
				status: {},
				total: null
			}
	}

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
		}
//		consumers: [
//			{idx: 1, name: 'Landzeit', consumed: 12313412, amount: 'EUR 1239,32.-'},
//			{idx: 2, name: 'OMV', consumed: 661312, amount: 'EUR 529,29.-'},
//			{idx: 3, name: 'McDonalds', consumed: 123112, amount: 'EUR 421,17.-'},
//			{idx: 4, name: 'Moser Medical Group', consumed: 3813, amount: 'EUR 189,15.-'},
//			{idx: 5, name: 'VIG (Vienna Insurance Group)', consumed: 3412, amount: 'EUR 139,12.-'}
//		]
	};

	$scope.sortableModel = [];
	$scope.sortableOptions = {
		connectWith: ".connectPanels",
		handler: ".ibox-title"
	};

	var trimArray = function(array, maxSize) {
		var s = array.length - maxSize;
		if(s > 0) {
			array.splice(0, s);
		}
		return array;
	};

	$scope.toggleShowLive = function() {
		console.log("toogle");
		if($scope.chart.update) {
			$scope.chart.labels = $scope.chart.labelsAll.slice(- MAX_LENGTH);
			$scope.chart.data[0] = $scope.chart.dataAll[0].slice(- MAX_LENGTH);
		}
	};
	
	$scope.$watch("chart.interval", function() {
		if(!$scope.chart.interval) return;
		subscribeWS($scope.chart);
	});

	var subscribeWS = function(chart) {
		if(chart.ws.readyState !== 1) return;
		var req = {};
		req[TYPE] = MSGTYPE_SUBSCRIBE;
		req.interval = chart.interval;
		chart.ws.send(JSON.stringify(req));
	};

	var initWS = function(chart) {
		/* subscribe to websocket */
		var url = appConfig.services.statisticsWebsocket.url;
		chart.ws = new WebSocket(url);
		chart.ws.onmessage = function(evt) {
			var msg = JSON.parse(evt.data);
			if(msg[TYPE] == MSGTYPE_DATA) {
				var data = msg[PAYLOAD];
				/* read counters */
				$scope.stats.requests.status[200] = data.counters['status_code.200'];
				$scope.stats.requests.status[500] = data.counters['status_code.500'];
				/* read chart data */
				var received = data.counters['statsd.packets_received'];
				var label = formatTime(new Date());
				$scope.chart.dataAll[0].push(received);
				$scope.chart.labelsAll.push(label);
				trimArray($scope.chart.dataAll[0], MAX_LENGTH_ALL);
				trimArray($scope.chart.labelsAll, MAX_LENGTH_ALL);
				if($scope.chart.update) {
					$scope.chart.data[0].push(received);
					$scope.chart.labels.push(label);
					trimArray($scope.chart.data[0], MAX_LENGTH);
					trimArray($scope.chart.labels, MAX_LENGTH);
					$scope.$apply();
				}
			}
		};
		chart.ws.onopen = function(evt) {
			subscribeWS(chart);
		};
	};

	/* get nav. bar stack */
	$scope.getNavPart = function() {
		return { sref: "index.dashboard", name: "Dashboard" };
	};
	$scope.setNavPath($scope, $state);

	/* load main elements */
	initWS($scope.chart);
}

angular.module('rioxApp').controller('DashboardCtrl', dashboardCtrl);