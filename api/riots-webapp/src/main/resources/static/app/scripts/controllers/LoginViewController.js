var app = angular.module("app");
app.controller('LoginViewController', [
    '$scope', '$http', '$compile',
    function ($scope, $http, $compile) {

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

    }
]);
