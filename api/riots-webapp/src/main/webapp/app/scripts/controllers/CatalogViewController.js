define(['app', 'bootstrap-tagsinput'], function (app) {

    angular.module('infinite-scroll').value('THROTTLE_MILLISECONDS', 500);

    app.controller('CatalogViewController',
        function ($scope, $http, $compile, $log) {

            AppController($scope, $http, $compile);

            $scope.highlightMenuItem("#menuItemCatalog");

            $scope.thingTypesAPI = appConfig.services.thingTypes.url;
            $scope.thingTypePropsAPI = appConfig.services.thingTypeProps.url;
            $scope.semanticsAPI = appConfig.services.semanticTypes.url;
            $scope.driversAPI = appConfig.services.drivers.url;
            $scope.searchText = '';
            $scope.shared.selectedThingType = null;
        }
    );


    // factory for infinite scrolling
    app.factory('ThingTypes', function ($http, $log) {
        var ThingTypes = function (thingTypesAPI, searchText) {
            this.api = thingTypesAPI;
            $log.debug("Using API: " + this.api);
            this.searchText = searchText;
            this.items = [];
            this.busy = false;
            this.page = 0;
            this.size = 50;
            this.fullyLoaded = false;
        };

        ThingTypes.prototype.nextPage = function () {
            $log.debug("nextPage() called");
            if (this.busy || this.fullyLoaded) return;
            this.busy = true;

            invokeGET($http, this.api + "?q=" + this.searchText + "&page=" + this.page + "&size=" + this.size,
                function (data, status, headers, config) {
                    var items = data.result;
                    if (items.length == 0) {
                        this.fullyLoaded = true;
                    }
                    for (var i = 0; i < items.length; i++) {
                        this.items.push(items[i]);
                    }
                    this.page = this.page + 1;
                    console.log("page: " + this.page)
                    this.busy = false;
                }.bind(this));
        };
        return ThingTypes;
    });

    app.controller('ThingTypesController',

        function ($scope, $log, ThingTypes, hotkeys, $location) {

            $log.debug("Inside ThingTypesController");

            $scope.focusSearchInput = function () {
                angular.element("#searchInput").trigger('focus');
            };

            // for infinite scrolling
            $scope.thingTypes = new ThingTypes($scope.thingTypesAPI, $scope.searchText);

            $scope.showMore = function (thingId) {
                $("#" + thingId + "_description").removeClass("thing-type-box");
                $("#" + thingId + "_expand").addClass("invisible");
                $("#" + thingId + "_collapse").removeClass("invisible");
            };

            $scope.showLess = function (thingId) {
                $("#" + thingId + "_description").addClass("thing-type-box");
                $("#" + thingId + "_expand").removeClass("invisible");
                $("#" + thingId + "_collapse").addClass("invisible");
            };

            var setupDragAndDrop = function () {
                // set up drag/drop
                var selector = "#thingTypesTable .ui-grid-row";
                $(selector).draggable({
                    helper: function () {
                        return $("<div style='z-index: 100000'>" +
                        "<img src='img/icon_map_add.png'/></div>");
                    },
                    start: function (event, ui) {
                        $(this).css("z-index", 100000);
                    },
                    cursorAt: {top: 24, left: 25},
                    appendTo: "body",
                    zIndex: 100000
                });
            };


            // Entry point for key press during thing type search
            $scope.searchKeyPress = function () {
                $log.debug("User enter searchterm: ", $scope.searchText);
                invokeGET($scope.http, $scope.thingTypesAPI + "?q=" + $scope.searchText,
                    function (data, status, headers, config) {
                        $log.debug("Search Results: ", data.result);
                        $scope.thingTypes.items = data.result
                    }
                );
            };

            $scope.selectTag = function (tag) {
                $scope.searchText = "tags:" + tag;
                $scope.searchKeyPress();
            };

            $scope.editItem = function(itemId) {
                $location.path("catalog/" + itemId);
            };

            $scope.deleteThingType = function (thingType) {
                var location;
                if (!(thingType && thingType.id) && $scope.shared.selectedThingType) {
                    thingType = $scope.shared.selectedThingType;
                    location = "catalog";
                }

                $log.warn("About to delete ThingType: ", thingType);
                $log.debug("Redirecting to location afterwards: ", location);

                showConfirmDialog("Do you really want to delete this thing type?", function () {
                    invokeDELETE($scope.http,
                        $scope.thingTypesAPI + "/" + thingType.id,
                        function (data, status, headers, config) {
                            $scope.selectedThingType = $scope.shared.selectedThingType = null;
                            $scope.searchKeyPress();
                            if (location) {
                                $location.path(location);
                            }
                        }
                    );
                });
            };

        }
    );
});
