
var app = angular.module("rioxApp");
app.controller('OrganizationsController',
		function ($scope, $state, Upload, Auth, growl) {

	var fileServiceURL = window.appConfig.services.files.url;
	var fileServiceURLAbs = resolve(fileServiceURL);

	$scope.selected = {};
	$scope.usersServiceURL = window.appConfig.services.users.url;
	$scope.emailPattern = /^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$/;
	$scope.currentUser = $scope.getCurrentUser();

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
	};

	$scope.removeMember = function(mem) {
		var org = $scope.selected.organization;
		if(!org || !mem) return;
		showConfirmDialog("Do you really want to remove this member from the organization?", function () {
			riox.delete.organization.membership(mem, function() {
				loadOrgs();
			}, function(error) {
				growl.warning("Unable to delete membership.");
			});
		});
	};
	$scope.addMember = function() {
		var org = $scope.selected.organization;
		if(!org) return;
		var mem = {};
		mem[ORGANIZATION_ID] = org[ID];
		if($scope.newMember && $scope.newMember.originalObject) {
			mem[MEMBER] = $scope.newMember.originalObject.id;
			var user = Auth.getCurrentUser();
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
		}, function(error) {
			error = error.responseJSON || error;
			error = error.__result || error;
			if(error.error) {
				growl.warning(error.error);
			} else {
				growl.warning("Could not send invitation (unknown error)");
				console.log(error);
			}
		});
	};

	var loadOrgs = function() {
		$scope.orgInfo = {};
		var user = $scope.getCurrentUser();
		var query = {};
		riox.organizations(query, function(orgs) {
			$scope.orgInfo.orgs = orgs;
			$.each(orgs, function(idx, org) {
				if(org[CREATOR_ID]) {
					var query = {};
					query[ID] = org[CREATOR_ID];
					/* load creator user details */
					riox.user(query, function(user) {
						org.creatorDisplayName = user.name;
		   				$scope.$apply();
					});
				}
				if($scope.selected.organization && $scope.selected.organization[ID] == org[ID]) {
					$scope.selected.organization = org;
				}
	   			if(org[IMAGE_DATA] && org[IMAGE_DATA][0]) {
	   				org.imageUrl = org[IMAGE_DATA][0].href;
	   			}
   				org[STATUS] = STATUS_UNKNOWN;
	   			riox.organizations.memberships(org, function(mems) {
	   				org.memberships = mems;
	   				mems.forEach(function(mem) {
	   					if(mem[MEMBER] == user[EMAIL] || mem[MEMBER] == user[ID]) {
	   						org.membership = mem;
	   					}
	   					/* load member user details */
	   					var query = {};
	   					query[ID] = mem[MEMBER];
	   					riox.user(query, function(user) {
	   						mem[NAME] = user.name;
	   		   				$scope.$apply();
	   					});
	   				});
	   				org[STATUS] = org.membership ? org.membership[STATUS] : "OWNER";
	   				$scope.$apply();
	   			});
			});
			$scope.$apply();
		});
	};

	$scope.acceptInvitation = function(org) {
		var mem = org.membership[ID];
		riox.organization.invite.accept(mem, function() {
			loadOrgs();
			growl.info("Organization membership successfully updated.");
		});
	};
	$scope.rejectInvitation = function(org) {
		var mem = org.membership[ID];
		riox.organization.invite.reject(mem, function() {
			loadOrgs();
			growl.info("Organization membership successfully updated.");
		});
	};

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
	};
	$scope.setNavPath($scope, $state);

	/* load main elements */
	loadOrgs();

});
