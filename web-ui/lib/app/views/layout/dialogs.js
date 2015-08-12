var app = angular.module("rioxApp");
app.controller('DialogController', [
	'$scope', '$modal', '$sce',
	function ($scope, $modal, $sce) {

		window.showSelectDialog = function (dialog, options, callback) {
			showDialog("select", dialog, options, callback);
		};
		window.showInputDialog = function (dialog, callback) {
			showDialog("input", dialog, [], callback);
		};
		window.showErrorDialog = function (dialog, details, callback) {
			var display = '<p>The following error has occured: ' + dialog + '</p>' +
				(details ? ('<h4>Error Details</h4>' + '<p>' + details + '</p>') : "");
			showDialog("error", display, [], callback, "lg");
		};
		window.showSuccessDialog = function (dialog, callback) {
			showDialog("info", dialog, [], callback, "lg");
		};
		window.showConfirmDialog = function (dialog, callback) {
			var display = '<p>' + dialog + '</p>';
			showDialog("confirm", display, [], callback);
		};

		window.showDebugDialog = function (dialog, title, highlight, callback) {
			showDialog("debug", {content: dialog, title: title}, [], callback, "lg", highlight);
		};

		window.showEditorDialog = function(dialog, title, editor, callback) {
			showDialog('editor', {content: dialog, title: title}, [], callback, "lg", editor.options)
		};

		var showDialog = function (type, dialog, options, callback, size, highlight) {

			var modalInstance = $modal.open({
				templateUrl: 'dialogContent.html',
				controller: 'DialogInstanceController',
				size: size ? size : "md",
				resolve: {
					dialog: function () {
						return $sce.trustAsHtml(dialog.content ? dialog.content : dialog);
					},
					options: function () {
						return options;
					},
					type: function () {
						return type;
					},
					highlight: function () {
						return highlight;
					},
					title: function () {
						return dialog.title ? dialog.title : '';
					}
				}
			});

			modalInstance.result.then(function (result) {
				if (callback)
					callback(result);
			}, function () {
				/* modal dismissed/canceled */
			});
		};
	}
]);

app.controller('DialogInstanceController', function ($scope, $modalInstance, type, dialog, options, highlight, title) {

	if (title) {
		$scope.title = title;
	} else {
		$scope.title = type == "error" ?
			'' : type == "info" ?
			'' : type == 'debug' ?
			'' : type == "confirm" ?  "Confirm" : "Input Dialog";
	}

	if (type == 'editor') {
		$scope.editor = true;
		$scope.editorOptions = highlight
	}

	$scope.titleImg = type == "error" ? "img/alert.svg" : "";
	$scope.titleSpanClass = type == "info" ? "fa fa-check" : type == 'debug' ? 'fa fa-code' : '';
	$scope.type = type;
	$scope.dialog = dialog.content ? dialog.content : dialog;
	$scope.options = options;
	$scope.selected = options.length ? options[0] : null;
	$scope.input = "";
	if (!$scope.editor && highlight) {
		$scope.highlight = highlight;
	}

	$scope.ok = function () {
		$modalInstance.close(
			      type == 'select' ? $scope.selected
				: type == 'input' ? $scope.input
				: type == 'editor' ? $scope.editorContent
				: null
		);
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
});
