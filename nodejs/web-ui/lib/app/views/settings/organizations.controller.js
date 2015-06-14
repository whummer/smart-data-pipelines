
var app = angular.module("rioxApp");
app.controller('OrganizationsController',
		function ($scope, Upload, Auth, growl) {

	var fileServiceURL = appConfig.services.files.url;
	var fileServiceURLAbs = resolve(fileServiceURL);

	$scope.selected = {};
	$scope.usersServiceURL = appConfig.services.users.url;
	$scope.emailPattern = /^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$/;

	$scope.saveOrganization = function() {
		var org = $scope.selected.organization;
		if(!org) return;
		org = clone(org);
		var url = org.imageUrl;
		delete org.creatorDisplayName;
		delete org.status;
		delete org.imageUrl;
		org[IMAGE_DATA] = [ { href: url } ];
		riox.save.organization(org, function() {
			growl.success("Organization details saved successfully.");
			loadOrgs();
			Auth.loadOrganization();
		});
	}

	$scope.removeMember = function(index) {
		var main = $scope.selected.organization;
		if(!main) return;
		if(!main.members) main.members = [];
		main.members.splice(index, 1);
	}
	$scope.addMember = function() {
		var org = $scope.selected.organization;
		if(!org) return;
		var mem = {};
		mem[ORGANIZATION_ID] = org[ID];
		if($scope.newMember) {
			mem[MEMBER] = $scope.newMember;
		} else {
			var email = $("#inputNewMem_value").val();
			if(!email.match($scope.emailPattern)) {
				growl.warning("Please select a user from the list, or type a valid email address.");
				return;
			}
			mem[MEMBER] = email;
		}
		riox.add.organization.invite(mem, function() {
			growl.info("Invitation has been sent out.");
			loadOrgs();
		});
//		console.log($("#inputNewMem").val());
	}

	var loadOrgs = function() {
		$scope.orgInfo = {};
		var user = $scope.getCurrentUser();
		riox.organizations(function(orgs) {
			$scope.orgInfo.orgs = orgs;
			$.each(orgs, function(idx, org) {
				var query = {};
				query[ID] = org[CREATOR_ID];
				riox.user(query, function(user) {
					org.creatorDisplayName = user.name;
				});
				if($scope.selected.organization && $scope.selected.organization[ID] == org[ID]) {
					$scope.selected.organization = org;
				}
	   			if(org[IMAGE_DATA] && org[IMAGE_DATA][0]) {
	   				org.imageUrl = org[IMAGE_DATA][0].href;
	   			}
	   			riox.organizations.memberships(org, function(mems) {
	   				org.memberships = mems;
	   				mems.forEach(function(mem) {
	   					if(mem[MEMBER] == user[EMAIL] || mem[MEMBER] == user[ID]) {
	   						org.membership = mem;
	   					}
	   				});
	   				org[STATUS] = org.membership ? org.membership[STATUS] : "OWNER";
	   			});
				// TODO remove?
//				var userInfo = $scope.getCurrentUser();
//				if(userInfo) {
//					if(el[CREATOR_ID] == userInfo.id) {
//			   			var dfltOrg = $scope.selected.organization = el;
//			   			if(!dfltOrg.members) {
//			   				dfltOrg.members = [];
//			   			}
//			   			if(dfltOrg[IMAGE_DATA] && dfltOrg[IMAGE_DATA][0]) {
//			   				dfltOrg.imageUrl = dfltOrg[IMAGE_DATA][0].href;
//			   			}
//					} else {
//						$scope.orgInfo.additional.push(el);
//					}
//				} else {
//					console.warn("Unable to determine userInfo from scope.")
//				}
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
	   			var selOrg = $scope.selected.organization;
	   			var id = data.replace(/"/g, "");
	   			selOrg.imageUrl = fileServiceURLAbs + "/" + id;
	   			$scope.saveOrganization();
            });
        }
    };
    
    $scope.deleteImage = function() {
    	$scope.selected.organization.imageUrl = null;
    	$scope.selected.organization[IMAGE_DATA] = [];
    };

	/* register event handlers */
	$scope.$watch("files", function () {
		var files = $scope.files;
		if (files && files.length) {
	        upload(files);
		}
    });

	/* get nav. bar stack */
	$scope.getNavPart = function() {
		return { sref: "index.settings.organizations", name: "Organizations" };
	}
	$scope.setNavPath($scope);

	/* load main elements */
	loadOrgs();

});
