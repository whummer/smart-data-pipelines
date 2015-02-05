var app = angular.module("app");
app.controller('LoginViewController', [
    '$scope', '$http', '$compile', '$routeParams', '$location',
    function ($scope, $http, $compile, $routeParams, $location) {

    	console.log("LoginViewController");

    	$scope.loginType = { riots: true };
    	$scope.loginInfo = {
    			username: "",
    			password: "",
    			action: "login"
    	};
    	$scope.regInfo = {};
    	
    	$scope.loginInfo.action = 
    		($location.$$path == "/signup") ? "signup" :
            ($location.$$path.indexOf("/activate") == 0) ? "activate" : 
            ($location.$$path == "/login") ? "login" : "";

        $scope.login = function (network) {
            //console.log(network, hello, hello(network));

            var result = loginViaOAuth(network, false, function (authInfo) {
                if (authInfo) {
                    /* set auth info */
            		writeCookie("riots-auth-network", authInfo.network);
            		writeCookie("riots-auth-token", authInfo.access_token);
                    window.location.href = "/";
                } else {
                    // TODO
                    console.log("Login error.");
                }
            });

        }

        $scope.loginUserPass = function() {
        	var btn = $("#btnSignIn");
        	btn.attr("disabled", "disabled");
        	$scope.loginInfo.errorMsg = "";
        	$scope.loginInfo.successMsg = "";
        	$scope.loginInfo.warningMsg = "";

        	var opts = {
        			username: $scope.loginInfo.username,
        			password: $scope.loginInfo.password
        	};
        	riots.login(opts, function(authInfo) {
        		$scope.loginInfo.successMsg = "Login successful";
        		if(!authInfo.email) {
        			authInfo.email = authInfo.username;
        		}
        		window.authInfo = rootScope.authInfo = authInfo;
                /* set auth info */
        		writeCookie("riots-auth-network", "riots");
        		writeCookie("riots-auth-token", authInfo.accessToken);
                window.location.href = "/";
        	}, function(error) {
            	btn.removeAttr("disabled");
        		$scope.loginInfo.errorMsg = error.result.message;
        		if(!$scope.loginInfo.errorMsg) {
        			$scope.loginInfo.errorMsg = "Login failed. Please try again.";
        		}
        	});
        }

        $scope.loginSignup = function() {
        	$scope.regInfo.errorMsg = "";
        	$scope.regInfo.successMsg = "";
        	if(!$scope.regInfo.password1 || !$scope.regInfo.password2 
        			|| !$scope.regInfo.email || !$scope.regInfo.firstname
        			 || !$scope.regInfo.lastname) {
        		$scope.regInfo.errorMsg = "Please fill out all fields.";
        		return;
			}
        	if($scope.regInfo.password1 != $scope.regInfo.password2) {
        		$scope.regInfo.errorMsg = "Passwords do not match.";
        		return;
			}
        	var btn = $("#btnSignUp");
        	btn.attr("disabled", "disabled");
        	var signupInfo = {
            		email: $scope.regInfo.email,
            		password: $scope.regInfo.password1,
            		firstname: $scope.regInfo.firstname,
            		lastname: $scope.regInfo.lastname,
        	};
        	riots.signup(signupInfo, function() {
        		$scope.regInfo.successMsg = "Sign-up successful. Please check your email for activation details.";
        	}, function(error) {
            	btn.removeAttr("disabled");
        		$scope.regInfo.errorMsg = error.result.message;
        	});
        }

        if($routeParams.activationKey) {
        	$scope.regInfo.activationKey = $routeParams.activationKey;
        	riots.activate($routeParams.activationKey, function() {
        		$scope.regInfo.activationMsg = "Your account email has been successfully activated.";
        	}, function() {
        		$scope.regInfo.activationMsg = "An error has occurred, possibly this account has already been activated. " +
        			"Please try to log in using your account credentials.";
        	});
        }


        $scope.$watch("loginType.riots", function() {
        	if(!$scope.loginType) return;
        	$scope.loginType.oauth = !$scope.loginType.riots;
        });
        $scope.$watch("loginType.oauth", function() {
        	if(!$scope.loginType) return;
        	$scope.loginType.riots = !$scope.loginType.oauth;
        });
    }
]);
