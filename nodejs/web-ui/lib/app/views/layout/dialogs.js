
var app = angular.module("rioxApp");
app.controller('DialogController', [
	'$scope', '$modal', '$sce',
	function($scope, $modal, $sce) {

	  	window.showSelectDialog = function (dialog, options, callback) {
	  		showDialog("select", dialog, options, callback); 
	  	}
	  	window.showInputDialog = function (dialog, callback) {
	  		showDialog("input", dialog, [], callback); 
	  	}
	  	window.showErrorDialog = function (dialog, details, callback) {
	  		var display = '<p>The following error has occured: ' + dialog + '</p>' +
			//'<p>Please try again, or contact us if the problem persists.</p>' +
			(details ? ('<h4>Error Details</h4>' + '<p>' + details + '</p>') : "");
	  		showDialog("error", display, [], callback, "lg");
	  	}
	  	window.showConfirmDialog = function (dialog, callback) {
	  		var display = '<p>' + dialog + '</p>';
	  		showDialog("confirm", display, [], callback);
	  	}

	  	var showDialog = function (type, dialog, options, callback, size) {
		    var modalInstance = $modal.open({
				templateUrl: 'dialogContent.html',
				controller: 'DialogInstanceController',
				size: size ? size : "md",
				resolve: {
					dialog: function () {
						return $sce.trustAsHtml(dialog);
					},
			 		options: function () {
						return options;
					},
			 		type: function () {
						return type;
					}
				}
		    });

		    modalInstance.result.then(function (selectedItem) {
				if(callback)
					callback(selectedItem);
		    }, function () {
		 		/* modal dismissed/canceled */
		    });
		};
	}
]);

app.controller('DialogInstanceController', function (
	$scope, $modalInstance, type, dialog, options) {

		$scope.title = type == "error" ? "" : type == "confirm" ? "Confirm" : "Input Dialog";
		$scope.titleImg = type == "error" ? "img/alert.svg" : "";
		$scope.type = type;
		$scope.dialog = dialog;
		$scope.options = options;
		$scope.selected = options.length ? options[0] : null;
		$scope.input = "";
	
		$scope.ok = function () {
	  		$modalInstance.close(
	    		type == 'select' ? $scope.selected :
	    		type == 'input' ? $scope.input : null
	    	);
	  	};
	
		$scope.cancel = function () {
	  	$modalInstance.dismiss('cancel');
  	};
});
