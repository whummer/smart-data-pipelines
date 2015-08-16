var app = angular.module('rioxApp');
angular.module("leaflet-directive", []);

app.controller('MapKibanaCtrl', function($scope, leafletData) {

	$scope.insertData = function() {
		var req = {
				action: "insertData"
		};
		var url = "/demo";
		$("#btnInsert").prop("disabled", true);
		$("#btnInsert").html("Loading, please wait...");
		riox.callPOST(url, req, function(res) {
			$("#btnInsert").prop("disabled", false);
			$("#btnInsert").hide();
			$scope.displayKibana(res.url);
		});
	};

	var find = function(frameName, selector) {
		var node = !frameName ? window.document : $(frameName).get(0).contentDocument.documentElement;
		var selected = $(node).find(selector);
		return selected;
	};

	var poll = function(frameName, selector, callback) {
		var interval = setInterval(function () {
			var selected = find(frameName, selector);
			//console.log(node, selected);
		    if (selected.length) {
		        clearInterval(interval);
		        callback(selected);
		    }
		}, 500);
		return interval;
	};

	$scope.displayKibana = function(url) {
		$("#kibanaFrame").attr("src", url);
		$("#kibanaFrame").ready(function() {
			var doc = $("#kibanaFrame").get(0).contentDocument;
			var frameName = "#kibanaFrame";
			var pollIndexName = poll(frameName, "input[ng-model='index.name']", function(result) {
				clearInterval(pollMap);
				var win = $(frameName).get(0).contentWindow;
				var ang = win.angular;
				var scope = ang.element($(result)).scope();
			    scope.$apply(function(){
			        scope.index.name = "smart*";
			    });
			    poll(frameName, "button[type='submit']", function(btn) {
				    console.log("clicking");
				    btn.click();
			    });
			});
			var pollTimeBased = poll("#kibanaFrame", "input[ng-model='index.isTimeBased']", function(result) {
				//console.log("result", result);
				$(result).click();
			});
			var pollIndexCreatedPage = poll("#kibanaFrame", "div[class='index-pattern-name']", function(result) {
				/* index created, now re-load frame */
				$("#kibanaFrame").attr("src", url);
			});
			var pollMap = poll("#kibanaFrame", "div[class='chart-wrapper']", function(result) {
				clearInterval(pollIndexName);
		        clearInterval(pollTimeBased);
		        clearInterval(pollIndexCreatedPage);

		        poll("#kibanaFrame", "div[title='Fit Data Bounds']", function(result) {
		        	// TODO
		        });

		        var pane = find("#kibanaFrame", "div[class='leaflet-overlay-pane']");
		        var svg = pane.get(0).children[0];
		        console.log(pane.children[0]);
			});
			
		});
	};

});
