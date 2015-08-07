{
	"name": "WartezeitenVisulationzPipe",
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
						"url": "http://www.wien.gv.at/wartezeiten/meldeservice/wartezeiten.svc/GetWartezeiten",
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
						"url": "http://www.wien.gv.at/wartezeiten/passservice/wartezeiten.svc/GetWartezeiten",
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
						"url": "http://www.wien.gv.at/wartezeiten/parkpickerl/wartezeiten.svc/GetWartezeiten",
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
						"location": "json-add-element.groovy",
						"sync-interval": 60,
						"variables": {
							"key" : "origin",
							"value" : "meldeservice"
						}
					}
				},
				{
					"class": "processor",
					"type": "script",
					"label": "add-discriminator-element-passservice",
					"description": "Adds origin (Passservice)",
					"options": {
						"location": "json-add-element.groovy",
						"sync-interval": 60,
						"variables": {
							"key": "origin",
							"value" : "passservice"
						}
					}
				},
				{
					"class": "processor",
					"type": "script",
					"label": "add-discriminator-element-passservice",
					"description": "Adds origin (Packpickerl)",
					"options": {
						"location": "json-add-element.groovy",
						"sync-interval": 60,
						"variables": {
							"key": "origin",
							"value" : "parkpickerlservice"
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
				"location": "enrich-json-from-csv.groovy",
				"sync-interval": 60,
				"variables": {
					"csvFile": "file:///opt/xd-data/ma-data.csv"
				}
			}
		},
		{
			"class": "sink",
			"type": "map-visualization",
			"label": "visualize-data-in-map",
			"description": "visualize data in a kibana map",
			"options": {
				"index" : "smartcity",
				"type" : "waitingtimes"
			}
		}
	]
}
