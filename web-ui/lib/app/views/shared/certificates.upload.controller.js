
angular.module('rioxApp').controller('CertUploadCtrl', 
		function($scope, $log, $http, growl, Upload, $state) {

	var fileServiceURL = window.appConfig.services.files.url;
	var fileServiceURLAbs = resolve(fileServiceURL);

	var HEADER_NAME_ALLOW_ORIGIN = "access-control-allow-origin";
	var HEADER_VALUE_INTERNAL_USE_ONLY = "__internal__";
	var HEADER_NAME_CONTENT_TYPE = "content-type";

    var upload = function (files, callback) {
    	if(!files) return;
    	if(files.length != 1) {
			growl.warning("Please select a single file.");
			return;
		}
    	var file = files[0];

        var url = fileServiceURL + '/upload';
        var headers = {};
        headers[HEADER_NAME_ALLOW_ORIGIN] = HEADER_VALUE_INTERNAL_USE_ONLY;
        //headers[HEADER_NAME_CONTENT_TYPE] = "multiplart/form-data";
        Upload.upload({
            url: url,
            file: file,
            fileFormDataName: 'uploadfile',
            transformRequest: angular.identity,
            headers: headers
        }).success(callback);
    };

    var uploadCRT = function() {
    	if(!$scope.filesSelectCRT) return;
		upload($scope.filesSelectCRT, function (data, status, headers, config) {
			if(data.fileID) data = data.fileID;
   			var id = data.replace(/"/g, "");
   			$scope.resourceData.certCRT = id;
        });
    };

    var uploadKEY = function() {
    	if(!$scope.filesSelectKEY) return;
		upload($scope.filesSelectKEY, function (data, status, headers, config) {
			if(data.fileID) data = data.fileID;
   			var id = data.replace(/"/g, "");
   			$scope.resourceData.certKEY = id;
        });
    };

	/* register event handlers */
	$scope.$watch("filesSelectCRT", uploadCRT);
	$scope.$watch("filesSelectKEY", uploadKEY);

});
