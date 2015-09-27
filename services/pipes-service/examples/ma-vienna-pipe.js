{
	"name": "Vienna Aemter - Waiting times analytics",
	"description": "Analyses and visualizes the waiting times of the key citizen services of the Vienna government",
	"elements": [
		{
			"id": "wienma1",
			"category": "source",
			"type": "http-out",
			"params": {
				"name": "Wartezeiten: Meldeamt",
				"url": "http://www.wien.gv.at/wartezeiten/meldeservice/wartezeiten.svc/GetWartezeiten",
				"method": "GET",
				"interval": 10
			},
			"edges-out": ["wienma4"]
		},{
			"id": "wienma2",
			"category": "source",
			"type": "http-out",
			"params": {
				"name": "Wartezeiten: Passservice",
				"url": "http://www.wien.gv.at/wartezeiten/passservice/wartezeiten.svc/GetWartezeiten",
				"method": "GET",
				"interval": 10
			},
			"edges-out": ["wienma5"]
		},{
			"id": "wienma3",
			"category": "source",
			"type": "http-out",
			"params": {
				"name": "Wartezeiten: Parkpickerl",
				"url": "http://www.wien.gv.at/wartezeiten/parkpickerl/wartezeiten.svc/GetWartezeiten",
				"method": "GET",
				"interval": 10
			},
			"edges-out": ["wienma6"]
		},

		{
			"id": "wienma4",
			"category": "processor",
			"type": "script",
			"params": {
				"name": "Meldeservice",
				"location": "${scripts.dir}/json-add-element.groovy",
				"sync-interval": 60,
				"variables": {
					"key": "origin",
					"value": "meldeservice"
				}
			},
			"edges-out": ["wienma7"]
		},
		{
			"id": "wienma5",
			"category": "processor",
			"type": "script",
			"params": {
				"name": "Passservice",
				"location": "${scripts.dir}/json-add-element.groovy",
				"sync-interval": 60,
				"variables": {
					"key": "origin",
					"value": "passservice"
				}
			},
			"edges-out": ["wienma7"]
		},
		{
			"id": "wienma6",
			"category": "processor",
			"type": "script",
			"params": {
				"name": "Parkpickerl",
				"location": "${scripts.dir}/json-add-element.groovy",
				"sync-interval": 60,
				"variables": {
					"key": "origin",
					"value": "parkpickerl"
				}
			},
			"edges-out": ["wienma7"]
		},
		
		{
			"id": "wienma7",
			"category": "processor",
			"type": "split",
			"params": {
				"name": "Wartezeit Mapping",
				"mapping": "MBA.*:shortName:waitingTime"
			},
			"edges-out": ["wienma8"]
		},
		{
			"id": "wienma8",
			"category": "processor",
			"type": "enrich",
			"params": {
				"name": "Map IDs from CSV",
				"url": "${scripts.dir}/ma-data.csv",
				"sourceID": "OBJECTID",
				"targetID": "shortName",
				"mappings": "860435:MBA1_8,859029:MBA2,859030:MBA3,859057:MBA4_5,859050:MBA6_7,859042:MBA9,859032:MBA10,860422:MBA11,859051:MBA12,859058:MBA13_14,859037:MBA15,859060:MBA16,860503:MBA17,860425:MBA18,859028:MBA19,859026:MBA20,859065:MBA21,859040:MBA22,859076:MBA23"
			},
			"edges-out": ["wienma9"]
		},
		{
			"id": "wienma9",
			"category": "processor",
			"type": "script",
			"params": {
				"name": "Regex Replacer",
				"location": "${scripts.dir}/regexReplace.groovy",
				"variables": {
					"field": "SHAPE",
					"targetField": "location",
					"regex": "POINT\\s*\\((.*)\\s(.*)\\)",
					"replace": "$2 $1"
				}
			},
			"edges-out": ["wienma10"]
		},
		{
			"id": "wienma10",
			"category": "sink",
			"type": "geo-map",
			"params": {
				"name": "Display Map",
				"index": "smartcity",
				"type": "waitingtimes"
			}
		}
	]
}