function dashboardCtrl($scope, $state, $log, growl) {

	/* constants/configs */
	var MAX_LENGTH_ALL = 200;
	var MAX_LENGTH = 20;
	$scope.ISO_3166_COUNTRIES = ISO_3166_COUNTRIES;
	$scope.intervals = 
		[
		 {value: 1000, label: "1 sec"},
		 {value: 2000, label: "2 sec"}, 
		 {value: 5000, label: "5 sec"}, 
		 {value: 10000, label: "10 sec"}
		];

	/* chart config */
	$scope.chart = {};
	$scope.chart.series = ['# Requests'];
	$scope.chart.data = [[]];
	$scope.chart.dataAll = [[]];
	$scope.chart.labels = [];
	$scope.chart.labelsAll = [];
	$scope.chart.options = {
			animation : false
	};
	$scope.chart.update = true;
	$scope.chart.interval = 2000;
	$scope.showCountryDetails = true;
	
	/* stats hash */
	$scope.stats = {
		requests: {
			status: {},
			total: null
		},
		countries: {}
	}

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
		if(!chart.ws || chart.ws.readyState !== 1) return;
		var req = {};
		req[TYPE] = MSGTYPE_SUBSCRIBE;
		req.interval = chart.interval;
		chart.ws.send(JSON.stringify(req));
	};

	var initWS = function(chart) {
		/* subscribe to websocket */
		try {
			var url = window.appConfig.services.statisticsWebsocket.url;
			chart.ws = new WebSocket(url);
			chart.ws.onmessage = function(evt) {
				var msg = JSON.parse(evt.data);
				if(msg[TYPE] == MSGTYPE_DATA) {
					var data = msg[PAYLOAD];
					var received = null;
					/* read counters */
					if(data.counters) {
						$scope.stats.requests.status[200] = data.counters['status_code.200'];
						$scope.stats.requests.status[500] = data.counters['status_code.500'];
						received = data.counters['statsd.packets_received'];
					} else {
						received = data.numInvocations;
					}

					// TODO remove (testing only)
					//received = window.lastReceived = (window.lastReceived || 120) + (Math.random() - 0.5) * 10;

					/* read chart data */
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
		} catch(e) {
			growl.warning("Unable to connect to websocket. Please try again later.");
		}
	};

	var getCountryStats = function() {
		var res = $scope.countryStats = {};
		$scope.invocationStats.details.forEach(function(inv) {
			for(var key in inv.ips) {
				var obj = inv.ips[key];
				if(obj.country) {
					if(!res[obj.country]) {
						res[obj.country] = 0;
					}
					res[obj.country] += obj.timestamps.length;
				}
			};
		});
		$scope.stats.countries = res;
		// TODO remove (testing only)
//		$scope.stats.countries = {
//			"US": 100,
//			"DE": 60,
//			"CH": 10,
//			"FR": 55,
//			"UK": 60,
//			"AU": 75,
//			"CA": 45,
//			"AT": 50,
//			"BR": 75,
//			"RU": 60,
//			"ES": 60,
//			"EG": 60,
//			"IT": 65,
//		}
	};

	$scope.loadInvocationStats = function() {
		$scope.invocationStats = {};
		var query = {};
		query.details = true;
		riox.statistics.invocations(query, function(stats) {
			$scope.$apply(function() {
				$scope.invocationStats = stats;
				stats.requests = $scope.stats.requests = {
						status: stats.status,
						total: stats.numInvocations};
				getCountryStats();
			});
		});
	};

	$scope.countStatus = function(hash, statusRegex) {
		var result = 0;
		for(var key in hash) {
			if((""+key).match(statusRegex)) {
				result += hash[key];
			}
		}
		return result;
	};

	/* get nav. bar stack */
	$scope.getNavPart = function() {
		return { sref: "index.dashboard", name: "Dashboard" };
	};
	$scope.setNavPath($scope, $state);

	/* load main elements */
	initWS($scope.chart);
	$scope.loadInvocationStats();
}

angular.module('rioxApp').controller('DashboardCtrl', dashboardCtrl);