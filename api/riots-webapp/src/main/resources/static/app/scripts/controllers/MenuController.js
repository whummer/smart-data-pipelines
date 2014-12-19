/**
 * Created by omoser on 18/12/14.
 */


var app = angular.module('app');

console.log("Inside MenuController.js");

app.controller('ModalAddDeviceTypeController', ['$scope', '$modal', '$log', '$http', '$compile', function ($scope, $modal, $log, $http, $compile) {

    //AppController($scope, $http, $compile);

    $log.info("entering ModalAddDeviceTypeController");

    //$scope.items = ['', 'Wolfram', 'IOTDB', 'Sparkfun'];

    $scope.open = function (size) {

        var modalInstance = $modal.open({
            templateUrl: 'modalAddDeviceType.html',
            controller: 'ModalAddDeviceTypeInstanceCtrl',
            size: size
        });

        modalInstance.result.then(function (selectedItem) {
            $scope.selected = selectedItem;
        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

}]);


app.controller('ModalAddDeviceTypeInstanceCtrl', function ($scope, $modalInstance, $log, $http, $location, $compile) {

    //AppController($scope, $http, $compile);

    //$scope.items = items;
    $scope.selected = {
        item: 'riots'
    };

    $scope.http = $http;

    $scope.getImgSrcForSelectedItem = function (selectedItem) {
        $log.info("Selected item in render(): " + selectedItem);

        if (selectedItem == 'wolfram') {
            return "/app/img/wolfram_devices.jpeg";
        } else if (selectedItem == 'sparkfun') {
            return "/app/img/sparkfun.jpg";
        } else if (selectedItem == 'riots') {
            return "/app/img/riots.png";
        } else if (selectedItem == 'iotdb') {
            return "/app/img/iotdb.png";
        } else {
            return "/app/img/riots.png";
        }
    };

    $scope.ok = function () {
        $log.info("Selected item: " + $scope.selected.item);
        if ($scope.selected.item == 'riots') {
            addNewDeviceTypeManual($scope, $location, $log);
        } else {
            $log.warn("Selected thing type not yet implemented");
        }

        $modalInstance.close($scope.selected.item);

    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});