{
		"name": "Vienna Aemter - Waiting times analytics",
		"description": "Analyses and visualizes the waiting times of the key citizen services of the Vienna government",
		"elements": [
				{
						"class": "container",
						"type": "source",
						"label": "source-container-aemter",
						"description": "Source container for meldeamt, passamt, parkpickerl",
						"elements": [
								{
										"class": "element",
										"type": "source",
										"subtype": "http-out",
										"label": "poll-meldeamt",
										"description": "poll all meldeamt data per 10sec",
										"options": {
												"url": "http://www.wien.gv.at/wartezeiten/meldeservice/wartezeiten.svc/GetWartezeiten",
												"method": "GET",
												"interval": 10
										}
								},
								{
										"class": "element",
										"type": "source",
										"subtype": "http-out",
										"label": "poll-passamt",
										"description": "Poll all passamt data per 10sec",
										"options": {
												"url": "http://www.wien.gv.at/wartezeiten/passservice/wartezeiten.svc/GetWartezeiten",
												"method": "GET",
												"interval": 10
										}
								},
								{
										"class": "element",
										"type": "source",
										"subtype": "http-out",
										"label": "poll-parkpickerl",
										"description": "Poll all pickerl data per 10sec",
										"options": {
												"url": "http://www.wien.gv.at/wartezeiten/parkpickerl/wartezeiten.svc/GetWartezeiten",
												"method": "GET",
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
										"type": "processor",
										"subtype": "script",
										"label": "add-discriminator-element-meldeservice",
										"description": "Adds origin (Meldeservice)",
										"options": {
												"location": "${scripts.dir}/json-add-element.groovy",
												"sync-interval": 60,
												"variables": {
														"key": "origin",
														"value": "meldeservice"
												}
										}
								},
								{
										"class": "element",
										"type": "processor",
										"subtype": "script",
										"label": "add-discriminator-element-passservice",
										"description": "Adds origin (Passservice)",
										"options": {
												"location": "${scripts.dir}/json-add-element.groovy",
												"sync-interval": 60,
												"variables": {
														"key": "origin",
														"value": "passservice"
												}
										}
								},
								{
										"class": "element",
										"type": "processor",
										"subtype": "script",
										"label": "add-discriminator-element-passservice",
										"description": "Adds origin (Packpickerl)",
										"options": {
												"location": "${scripts.dir}/json-add-element.groovy",
												"sync-interval": 60,
												"variables": {
														"key": "origin",
														"value": "parkpickerlservice"
												}
										}
								}
						]
				},
				{
						"class": "element",
						"type": "processor",
						"subtype": "split",
						"label": "split-document-into-elements",
						"description": "Splits the big waiting times document into smaller ones",
						"options": {
								"mapping": "MBA.*:shortName:waitingTime"
						}
				},
				{
						"class": "element",
						"type": "processor",
						"subtype": "enricher-csv",
						"label": "enrich-with-location-data",
						"description": "Enriches waiting times with location data",
						"options": {
								"url": "${scripts.dir}/ma-data.csv",
								"sourceID": "OBJECTID",
								"targetID": "shortName",
								"mappings": "860435:MBA1_8,859029:MBA2,859030:MBA3,859057:MBA4_5,859050:MBA6_7,859042:MBA9,859032:MBA10,860422:MBA11,859051:MBA12,859058:MBA13_14,859037:MBA15,859060:MBA16,860503:MBA17,860425:MBA18,859028:MBA19,859026:MBA20,859065:MBA21,859040:MBA22,859076:MBA23"
						}
				},
				{
						"class": "element",
						"type": "processor",
						"subtype": "script",
						"label": "Adjust geo-coordinates",
						"description": "Adjust geo-coordinates to be readable by the map",
						"options": {
								"location": "${scripts.dir}/regexReplace.groovy",
								"variables": {
										"field": "SHAPE",
										"targetField": "location",
										"regex": "POINT\\s*\\((.*)\\s(.*)\\)",
										"replace": "$2 $1"
								}
						}
				},
				{
						"class": "element",
						"type": "sink",
						"subtype": "map",
						"label": "visualize-data-in-map",
						"description": "Visualize data in a kibana map",
						"options": {
								"index": "smartcity",
								"type": "waitingtimes"
						}
				}
		]
}
