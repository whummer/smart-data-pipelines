{
	"id": "sample2",
	"name": "Simple Demo Pipe (2)",
	"description": "HTTP in - transform - elasticsearch & websocket out",
	"elements": [
		{
			"id": "test-1-1",
			"category": "source",
			"type": "http-in",
			"params": {
				"name": "HTTP in",
				"port": 7788
			},
			"edges-out": ["test-1-2"]
		},
		{
			"id": "test-1-2",
			"category": "processor",
			"type": "transform",
			"params": {
				"name": "Transform"
			},
			"edges-out": ["test-1-3", "test-1-4"]
		},
		{
			"id": "test-1-3",
			"category": "sink",
			"type": "elasticsearch",
			"params": {
				"name": "ES out",
				"typeName": "testwebsocketout"
			}
		},
		{
			"id": "test-1-4",
			"category": "sink",
			"type": "websocket",
			"params": {
				"port": "7789"
			}
		}
	]
}