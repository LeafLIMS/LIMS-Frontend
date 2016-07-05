'use strict';

var app = angular.module('limsFrontend');

app.directive('gtlInputConfigField', function($rootScope, InventoryService) {
    return {
        restrict: 'E',
        scope: {
            field: '=',
            calculations: '=',
        },
        templateUrl: 'modules/configuration/views/fields/gtl-input-field.html',
        link: function($scope, elem, attrs) {

            if (!$scope.field) {
                $scope.field = {};
            } else {
                $scope.mText = $scope.field.measure;
                $scope.ltText = $scope.field.lookup_type;
            }

            $scope.filterLookupType = function(filterText) {
                return InventoryService.itemTypes({search: filterText});
            };

            $scope.filterMeasures = function(filterText) {
                return InventoryService.measures({search: filterText});
            };

            $scope.setLookupType = function(item) {
                $scope.field.lookup_type = item.name;
            };

            $scope.setMeasure = function(item) {
                $scope.field.measure = item.symbol;
            };

        },
    }
});

app.directive('gtlVariableConfigField', function(InventoryService) {
    return {
        restrict: 'E',
        scope: {
            field: '=',
        },
        templateUrl: 'modules/configuration/views/fields/gtl-variable-field.html',
        link: function($scope, elem, attrs) {

            if (!$scope.field) {
                $scope.field = {};
            } else {
                $scope.mText = $scope.field.measure;
            }

            $scope.filterMeasures = function(filterText) {
                return InventoryService.measures({search: filterText});
            };

            $scope.setMeasure = function(item) {
                $scope.field.measure = item.symbol;
            };

        },
    }
});

app.directive('gtlOutputConfigField', function(InventoryService) {
    return {
        restrict: 'E',
        scope: {
            field: '=',
            measures: '=',
            types: '=',
        },
        templateUrl: 'modules/configuration/views/fields/gtl-output-field.html',
        link: function($scope, elem, attrs) {

            if (!$scope.field) {
                $scope.field = {};
            } else {
                $scope.mText = $scope.field.measure;
                $scope.ltText = $scope.field.lookup_type;
            }

            $scope.filterLookupType = function(filterText) {
                return InventoryService.itemTypes({search: filterText});
            };

            $scope.filterMeasures = function(filterText) {
                return InventoryService.measures({search: filterText});
            };

            $scope.setLookupType = function(item) {
                $scope.field.lookup_type = item.name;
            };

            $scope.setMeasure = function(item) {
                $scope.field.measure = item.symbol;
            };

        },
    }
});

app.directive('gtlCalculationConfigField', function(WorkflowService) {
    return {
        restrict: 'E',
        scope: {
            field: '=',
        },
        templateUrl: 'modules/configuration/views/fields/gtl-calculation-field.html',
        link: function($scope, elem, attrs) {
        },
    }
});

app.directive('gtlStepConfigField', function(InventoryService) {
    return {
        restrict: 'E',
        scope: {
            field: '=',
            calculations: '=',
        },
        templateUrl: 'modules/configuration/views/fields/gtl-step-field.html',
        link: function($scope, elem, attrs) {
            if (!$scope.field || !$scope.field.properties) {
                $scope.field = {
                    properties: [],
                }
            } else {
                for (var i = 0; i < $scope.field.properties.length; i++) {
                    $scope.field.properties[i].mText = $scope.field.properties.measure;
                }
            }

            $scope.filterMeasures = function(filterText) {
                return InventoryService.measures({search: filterText});
            };

            $scope.setMeasure = function(prop, item) {
                prop.measure = item.symbol;
                console.log($scope.field.properties);
            };

            $scope.addParameter = function(step) {
                $scope.field.properties.push({});
            };

            $scope.removeParameter = function(step, index) {
                $scope.field.properties.splice(index, 1);
            };
        },
    }
});
