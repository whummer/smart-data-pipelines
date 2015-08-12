angular.module("rioxApp").controller("DataPipesCtrl", function ($scope) {

	console.log("Withing data pipes PARENT controller");

	$scope.trim = window.trim;

	//
	// sample pipelines
	//
	$scope.samplePipes = [
		{
			"elements": [
				{
					"type": "source",
					"cssClass": "pipeSource",
					"label": "http-in",
					"description": "ingest data from API",
					"config": {
						"name": "HTTP",
						"icon": "globe",
						"availableOptions": [
							{
								"name": "URL",
								"type": "String"
							},
							{
								"name": "Interval",
								"type": "Number"
							}
						],
						"options": {
							"URL": "http://www.a1.net",
							"Interval": 3
						}
					}
				},
				{
					"type": "processor",
					"cssClass": "pipeProcessor",
					"label": "transform-districts",
					"description": "transform all this shit",
					"config": {
						"name": "Transform",
						"icon": "gears",
						"availableOptions": []
					}
				},
				{
					"type": "sink",
					"cssClass": "pipeSink",
					"label": "dashboard",
					"description": "visualize waiting times in a TABLE",
					"config": {
						"name": "Table Visualization",
						"icon": "table",
						"availableOptions": []
					}
				}
			],
			"name": "TestPipe Seppl",
			"description": "Very cool pipe smoked by seppl",
			"pipeId": 0
		},

		{
			"elements": [
				{
					"type": "source",
					"cssClass": "pipeSource",
					"label": "twitter-search",
					"description": "ingest data from API",
					"config": {
						"name": "TwitterSearch",
						"icon": "twitter-square",
						"availableOptions": [
							{
								"name": "Query",
								"type": "String"
							},
							{
								"name": "Geocode",
								"type": "String"
							}
						],
						"options": {
							"Query": "strache :(",
							"Geocode": "43.312331,18.312329,15km"
						}
					}
				},
				{
					"type": "processor",
					"cssClass": "pipeProcessor",
					"label": "aggregate-3",
					"description": "aggregates 3 results",
					"config": {
						"name": "Aggregator",
						"icon": "share-alt fa-flip-horizontal",
						"availableOptions": []
					}
				},
				{
					"type": "sink",
					"cssClass": "pipeSink",
					"label": "dump-to-logfile",
					"description": "visualize waiting times in a TABLE",
					"config": {
						"name": "Logfile",
						"icon": "file-text-o",
						"availableOptions": [
							{
								"name": "LogfileName",
								"type": "String"
							}
						],
						"options": {
							"LogfileName": "/tmp/log.out"
						}
					}
				}
			],
			"name": "TestPipe Fritz",
			"description": "Not so cool this pipe",
			"pipeId": 1
		}

	];

	//
	// end sample data
	//



});
