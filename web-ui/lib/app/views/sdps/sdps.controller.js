angular.module("rioxApp").controller("DataPipesCtrl", function ($scope) {

	console.log("Withing data pipes PARENT controller");

	$scope.trim = window.trim;

	//
	// sample pipelines
	//
	$scope.samplePipes = [
		{
			"_id": "1d8yw8d1csd",
			"name": "WartezeitenPipe",
			"description": "my cool datapipe",
			"elements": [
				{
					"class": "element",
					"type": "source",
					"subtype": "http-out",
					"label": "poll-meldeamt",
					"description": "poll all meldeamt data per 10sec",
					"options": {
						"url": "http://wien.gv.at/api/meldeamt",
						"http-method": "GET",
						"interval": 10
					}
				},

				{
					"class": "element",
					"type": "processor",
					"subtype": "script",
					"label": "add-discriminator-element-meldeservice",
					"description": "Adds origin (Meldeservice)",
					"options": {
						"location": "file:// | s3:// | http://",
						"sync-interval": 60,
						"variables": {
							"origin": "Meldeservice",
							"has-wifi": "true"
						}
					}
				},
				{
					"class": "element",
					"type": "processor",
					"subtype": "script",
					"label": "enrich-with-location-data",
					"description": "enriches payload with location data",
					"options": {
						"location": "file:// | s3:// | http://",
						"sync-interval": 60,
						"variables": {
							"mapping-file": "mapping.in",
							"data-file": "data.in"
						}
					}
				},

				{
					"class": "element",
					"type": "sink",
					"subtype": "map",
					"label": "visualize-data-in-map",
					"description": "visualize data in a kibana map",
					"options": {}
				}


			]
		}


	]/*	$scope.samplePipes = [
	 {
	 "_id" : "1d8yw8d1csd",
	 "name": "WartezeitenPipe",
	 "description": "my cool datapipe",
	 "elements": [
	 {
	 "class": "container",
	 "type": "source",
	 "label": "source-container-aemter",
	 "description": "source container for meldeamt, passamt, parkpickerl",
	 "elements": [
	 {
	 "class": "element",
	 "type" : "source",
	 "subtype": "http-out",
	 "label": "poll-meldeamt",
	 "description": "poll all meldeamt data per 10sec",
	 "options": {
	 "url": "http://wien.gv.at/api/meldeamt",
	 "http-method": "GET",
	 "interval": 10
	 }
	 },
	 {
	 "class": "element",
	 "type": "source",
	 "subtype": "http-out",
	 "label": "poll-passamt",
	 "description": "poll all passamt data per 10sec",
	 "options": {
	 "url": "http://wien.gv.at/api/passamt",
	 "http-method": "GET",
	 "interval": 10
	 }
	 }
	 ]
	 },

	 {
	 "class": "container",
	 "type": "processor",
	 "label": "processor-container-aemter",
	 "description": "source container for meldeamt, passamt, parkpickerl",
	 "elements": [

	 {
	 "class": "element",
	 "type" : "processor",
	 "subtype": "script",
	 "label": "add-discriminator-element-meldeservice",
	 "description": "Adds origin (Meldeservice)",
	 "options": {
	 "location": "file:// | s3:// | http://",
	 "sync-interval": 60,
	 "variables": {
	 "origin": "Meldeservice",
	 "has-wifi": "true"
	 }
	 }
	 },
	 {
	 "class": "element",
	 "type" : "processor",
	 "subtype": "script",
	 "label": "add-discriminator-element-passservice",
	 "description": "Adds origin (Passservice)",
	 "options": {
	 "location": "file:// | s3:// | http://",
	 "sync-interval": 60,
	 "variables": {
	 "origin": "Passservice",
	 "has-wifi": "true"
	 }
	 }
	 }
	 ]
	 },

	 {
	 "class": "element",
	 "type" : "processor",
	 "subtype": "script",
	 "label": "enrich-with-location-data",
	 "description": "enriches payload with location data",
	 "options": {
	 "location": "file:// | s3:// | http://",
	 "sync-interval": 60,
	 "variables": {
	 "mapping-file": "mapping.in",
	 "data-file": "data.in"
	 }
	 }
	 },

	 {
	 "class": "element",
	 "type" : "sink",
	 "subtype": "map",
	 "label": "visualize-data-in-map",
	 "description": "visualize data in a kibana map",
	 "options": {

	 }
	 }


	 ]
	 }




	 ]*/;

	//
	// end sample data
	//


	/*
	 {
	 "name": "WartezeitenPipe",
	 "description": "my cool datapipe",
	 "elements": [
	 {
	 "class": "container",
	 "type": "source",
	 "label": "source-container-aemter",
	 "description": "source container for meldeamt, passamt, parkpickerl",
	 "elements": [
	 {
	 "class": "source",
	 "type": "http-poll",
	 "label": "poll-meldeamt",
	 "description": "poll all meldeamt data per 10sec",
	 "options": {
	 "url": "http://wien.gv.at/api/meldeamt",
	 "http-method": "GET",
	 "interval": 10
	 }
	 },
	 {
	 "class": "source",
	 "type": "http-poll",
	 "label": "poll-passamt",
	 "description": "poll all passamt data per 10sec",
	 "options": {
	 "url": "http://wien.gv.at/api/passamt",
	 "http-method": "GET",
	 "interval": 10
	 }
	 },
	 {
	 "class": "source",
	 "type": "http-poll",
	 "label": "poll-parkpickerl",
	 "description": "poll all pickerl data per 10sec",
	 "options": {
	 "url": "http://wien.gv.at/api/pickerl",
	 "http-method": "GET",
	 "interval": 10
	 }
	 }

	 ]
	 },

	 {
	 "class": "container",
	 "type": "processor",
	 "label": "processor-container-aemter",
	 "description": "source container for meldeamt, passamt, parkpickerl",
	 "elements": [

	 {
	 "class": "processor",
	 "type": "script",
	 "label": "add-discriminator-element-meldeservice",
	 "description": "Adds origin (Meldeservice)",
	 "options": {
	 "location": "file:// | s3:// | http://",
	 "sync-interval": 60,
	 "variables": {
	 "origin": "Meldeservice",
	 "has-wifi": "true"
	 }
	 }
	 },
	 {
	 "class": "processor",
	 "type": "script",
	 "label": "add-discriminator-element-passservice",
	 "description": "Adds origin (Passservice)",
	 "options": {
	 "location": "file:// | s3:// | http://",
	 "sync-interval": 60,
	 "variables": {
	 "origin": "Passservice",
	 "has-wifi": "true"
	 }
	 }
	 }
	 ]
	 },

	 {
	 "class": "processor",
	 "type": "script",
	 "label": "enrich-with-location-data",
	 "description": "enriches payload with location data",
	 "options": {
	 "location": "file:// | s3:// | http://",
	 "sync-interval": 60,
	 "variables": {
	 "mapping-file": "mapping.in",
	 "data-file": "data.in"
	 }
	 }
	 },

	 {
	 "class": "sink",
	 "type": "map-visualization",
	 "label": "visualize-data-in-map",
	 "description": "visualize data in a kibana map",
	 "options": {

	 }
	 }


	 ]
	 }
	 */


});
