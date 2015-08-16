/*
 angular.module('rioxApp').controller('PipelineCtrl', function PipelineCtrl($timeout, $scope, $element, dragularService) {


 /!*$timeout(function () { // timeount due to nested ngRepeat to be ready
 var container = angular.element(document.getElementsByClassName('containerVertical')),
 parentContainers = container.children(),
 nestedContainers = [];

 console.log("Container: ", container);
 console.log("ParentContainer: ", parentContainers);


 dragularService(container, {
 moves: function (el, container, handle) {
 return handle.classList.contains('row-handle');
 },
 containersModel: $scope.pipeline.elements
 });

 for (var i = 0; i < parentContainers.length; i++) {
 nestedContainers.push(parentContainers.eq(i).children()[1]);
 }

 console.log("NestedContainer: ", nestedContainers);

 dragularService(nestedContainers, {
 moves: function (el, container, handle) {
 return !handle.classList.contains('row-handle');
 },
 containersModel: (function getNestedContainersModel() {
 var parent = $scope.pipeline.elements,
 containersModel = [];
 for (var i = 0; i < parent.length; i++) {
 containersModel.push(parent[i].elements);
 }

 console.log('Container Model: ', containersModel);
 return containersModel;
 })()
 });
 }, 100);*!/



 });
 */
