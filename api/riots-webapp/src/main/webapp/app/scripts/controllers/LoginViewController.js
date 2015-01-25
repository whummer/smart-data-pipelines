var app = angular.module("app");
app.controller('LoginViewController', [
    '$scope', '$http', '$compile', '$routeParams',
    function ($scope, $http, $compile, $routeParams) {

    	$scope.loginType = { riots: true };
    	$scope.loginInfo = {
    			username: "",
    			password: "",
    			loginAction: $routeParams.loginAction
    	};
    	$scope.regInfo = {};

        $scope.login = function (network) {
            //console.log(network, hello, hello(network));

            var result = loginViaOAuth(network, false, function (authInfo) {

                if (authInfo) {
                    /* set auth info */
                    document.cookie = "riots-auth-network=" + authInfo.network;
                    document.cookie = "riots-auth-token=" + authInfo.access_token;
                    window.location.reload();
                } else {
                    // TODO
                    console.log("Login error.");
                }
            });

        }

        $scope.loginUserPass = function() {
        	$scope.loginInfo.errorMsg = "";
        	$scope.loginInfo.successMsg = "";
        	var opts = {
        			username: $scope.loginInfo.username,
        			password: $scope.loginInfo.password
        	};
        	riots.login(opts, function(authInfo) {
        		console.log("login success", authInfo);
        		$scope.loginInfo.successMsg = "Login successful";
        	}, function() {
        		console.log("login error.");
        		$scope.loginInfo.errorMsg = "Login failed. Please try again.";
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
        	var signupInfo = {
            		email: $scope.regInfo.email,
            		password: $scope.regInfo.password1,
            		firstname: $scope.regInfo.firstname,
            		lastname: $scope.regInfo.lastname,
        	};
        	riots.signup(signupInfo, function() {
        		$scope.regInfo.successMsg = "Sign-up successful. Please check your email for details.";
        	}, function(error) {
        		$scope.regInfo.errorMsg = error.result.message;
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
