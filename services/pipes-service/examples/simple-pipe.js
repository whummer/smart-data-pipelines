{
	"id": "sample1",
	"name": "Simple Demo Pipe (1)",
	"description": "HTTP in - transform - elasticsearch out",
	"elements": [
		{
			"id": "1simple1",
			"category": "source",
			"type": "http-in",
			"params": {
				"name": "HTTP in",
				"port": 7788
			},
			"edges-out": ["simple2"]
		},
		{
			"id": "1simple2",
			"category": "processor",
			"type": "transform",
			"params": {
				"name": "Transform"
			},
			"edges-out": ["simple3"]
		},
		{
			"id": "1simple3",
			"category": "sink",
			"type": "elasticsearch",
			"params": {
				"name": "ES out",
				"typeName": "waitingtimes"
			},
			"edges-out": ["simple4", "simple5"]
		},
		{
			"id": "1simple4",
			"category": "sink",
			"type": "geo-map",
			"params": {
				"name": "Draw Map",
				"typeName": "waitingtimes",
				"idField": "id"
			}
		},
		{
			"id": "1simple5",
			"category": "sink",
			"type": "chart",
			"params": {
				"name": "Draw Chart",
				"typeName": "waitingtimes",
				"valueField": "value",
				"timeField": "time",
				"search": "*",
				"titles": "Chart_Title_1"
			}
		}
	]
}