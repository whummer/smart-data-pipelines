
var app = angular.module("rioxApp");
app.controller('OrganizationController',
		function ($scope, Upload) {

	$scope.CREATOR_ID = CREATOR_ID;
	$scope.IMAGE_DATA = IMAGE_DATA;
	var fileServiceURL = appConfig.services.files.url;
	var fileServiceURLAbs = resolve(fileServiceURL);

	$scope.saveOrganization = function() {
		var main = $scope.orgInfo.main;
		if(!main) return;
		main = clone(main);
		var url = main.imageUrl;
		delete main.creatorDisplayName;
		delete main.status;
		delete main.imageUrl;
		main[IMAGE_DATA] = [ { href: url } ];
		riots.save.organization(main, function() {
			$scope.growlInfo("Organization details saved successfully.");
			loadOrgs();
		});
	}

	$scope.removeMember = function(index) {
		var main = $scope.orgInfo.main;
		if(!main) return;
		if(!main.members) main.members = [];
		main.members.splice(index, 1);
	}
	$scope.addMember = function() {
		var main = $scope.orgInfo.main;
		if(!main) return;
		if(!main.members) main.members = [];
		main.members.push("");
	}

	var loadOrgs = function() {
		$scope.orgInfo = {};
		riots.organizations(function(orgs) {
			$scope.orgInfo.orgs = orgs;
			$scope.orgInfo.additional = [];
			$.each(orgs, function(idx, el) {
				var userInfo = $scope.getCurrentUser();
				if(userInfo) {
					if(el[CREATOR_ID] == userInfo.id) {
			   			var dfltOrg = $scope.orgInfo.main = el;
			   			if(!dfltOrg.members) {
			   				dfltOrg.members = [];
			   			}
			   			if(dfltOrg[IMAGE_DATA] && dfltOrg[IMAGE_DATA][0]) {
			   				dfltOrg.imageUrl = dfltOrg[IMAGE_DATA][0].href;
			   			}
					} else {
						$scope.orgInfo.additional.push(el);
					}
				} else {
					console.warn("Unable to determine userInfo from scope.")
				}
			});
		});
	}

    var upload = function (files) {
    	//console.log("upload", files, angular.identity);
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var url = fileServiceURL + '/upload';
            //console.log("url", url, file, XMLHttpRequest, XMLHttpRequest.prototype);
            Upload.upload({
                url: url,
                file: file,
                fileFormDataName: 'filedata',
                'transformRequest': angular.identity
            }).progress(function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                //console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
            }).success(function (data, status, headers, config) {
                //console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
	   			var dfltOrg = $scope.orgInfo.main;
	   			var id = data.replace(/"/g, "");
	   			dfltOrg.imageUrl = fileServiceURLAbs + "/" + id;
            });
        }
    };

	/* register event handlers */
	$scope.$watch("files", function () {
		var files = $scope.files;
		if (files && files.length) {
	        upload(files);
		}
    });

	/* load main elements */
	loadOrgs();

});
