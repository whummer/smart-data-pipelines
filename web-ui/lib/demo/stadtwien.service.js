
var springxd = require('riox-services-base/lib/util/springxd.util');

var demo = function(req, res, next) {

	var body = req.body;

	/* 
	stream create --name fetchMeldeServiceData --definition "" --deploy
	stream create --name fetchPassServiceData --definition "" --deploy
	stream create --name fetchParkPickerlServiceData --definition "" --deploy

	stream create --name correlate --definition "queue:waitingtimes >  transform --script=enrich-json-from-csv.groovy --propertiesLocation=enrich-json-from-csv.properties --variables='csvFile=file:///tmp/ma-data.csv' | log" --deploy
	*/

	var promise = new Promise(function(resolve){ resolve(); });
	var domain = process.env.RIOX_ENV + ".svc.cluster.local";

	var create = function(streamID, streamDefinition, sleep) {
		sleep = typeof sleep == "undefined" ? 0 : sleep;
		return new Promise(function(resolve, reject) {
			springxd.createStream(streamID, streamDefinition, function(stream) {
				setTimeout(function() {
					resolve(stream);
				}, sleep);
			});
		});
	};
	var maDataFile = "file:///opt/xd-data/ma-data.csv";
	var create1 = function() {
		var id1 = "fetchMeldeServiceData";
		var def1 = "trigger --fixedDelay=60 | http-client --url='''http://www.wien.gv.at/wartezeiten/meldeservice/wartezeiten.svc/GetWartezeiten''' --httpMethod=GET | script --script=json-add-element.groovy --variables='key=origin,value=meldeservice' > queue:waitingtimes";
		return create(id1, def1);
	};
	var create2 = function() {
		var id2 = "fetchPassServiceData";
		var def2 = "trigger --fixedDelay=60 | http-client --url='''http://www.wien.gv.at/wartezeiten/passservice/wartezeiten.svc/GetWartezeiten''' --httpMethod=GET | script --script=json-add-element.groovy --variables='key=origin,value=passservice' > queue:waitingtimes";
		return create(id2, def2);
	};
	var create3 = function() {
		var id3 = "fetchParkPickerlServiceData";
		var def3 = "trigger --fixedDelay=60 | http-client --url='''http://www.wien.gv.at/wartezeiten/parkpickerl/wartezeiten.svc/GetWartezeiten''' --httpMethod=GET | script --script=json-add-element.groovy --variables='key=origin,value=parkpickerlservice' > queue:waitingtimes";
		return create(id3, def3);
	};
	var create4 = function() {
		var id4 = "correlate";
		var def4 = "queue:waitingtimes > transform --script=enrich-json-from-csv.groovy --propertiesLocation=enrich-json-from-csv.properties --variables='csvFile=" + maDataFile + "' " + 
			"> queue:corrResults";
		return create(id4, def4);
	};
	var create5 = function() {
		var id5 = "correlateToES";
		var def5 = "queue:corrResults > elasticsearch --mode=transport --guessSchemas=true --addTimestamp=true --clusterName=elasticsearch --hosts=elasticsearch." + domain + ":9300 --index=smartcity --type=waitingtimes";
		return create(id5, def5, 1000);
	};
//	var create6 = function() {
//		var id6 = "correlateToWS";
//		var def6 = "queue:ourresults > websocket";
//		return create(id6, def6, 1000);
//	};

	promise.
		then(create1).then(create2).
		then(create3).then(create4).
		then(create5).
		then(function() {
			var result = {};
			//result.url = "http://kibana." + domain + ":5601/";
			result.url = "http://kibana.platform.riox.io/";
			var indexPattern = "smart*";
			var field = "location";
			result.url += "#/visualize/create?embed&_a=(filters:!(),linked:!f,query:(query_string:(analyze_wildcard:!t,query:'*')),vis:(aggs:!((id:'1',params:(),schema:metric,type:count),(id:'2',params:(autoPrecision:!t," +
					"field:" + field + ",precision:2),schema:segment,type:geohash_grid)),listeners:(),params:(addTooltip:!t,heatBlur:15,heatMaxZoom:16,heatMinOpacity:0.1,heatNormalizeData:!t,heatRadius:25,isDesaturated:!t,mapType:'Scaled%20Circle%20Markers'),type:tile_map))&" +
					"indexPattern=" + indexPattern + "&type=tile_map&_g=()";
			res.json(result);
		});
	
};

module.exports.demo = demo;
