var app = angular.module("app");
app.controller('LoginViewController', [
    '$scope', '$http', '$compile',
    function ($scope, $http, $compile) {

    	$scope.loginType = { riots: true };
    	$scope.loginInfo = {
    			username: "",
    			password: ""
    	};

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
