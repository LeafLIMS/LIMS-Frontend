'use strict';

var app = angular.module('limsFrontend');

app.directive('gtlInputField', function($rootScope, InventoryService) {
    return {
        restrict: 'E',
        scope: {
            field: '=',
            isDisabled: '=',
            calculations: '=',
        },
        templateUrl: 'modules/workflows/views/fields/gtl-input-field.html',
        link: function($scope, elem, attrs) {

            $scope.filterLookupItems = function(filterText, lookupType) {
                var params = {
                    'item_type__name': lookupType,
                    'search': filterText,
                    'in_inventory': 'True',
                }
                return InventoryService.items(params);
            };

            $scope.setLookupItem = function(item) {
                $scope.field[$scope.field.store_value_in] = item.identifier;
            };

        }
    }
});

app.directive('gtlVariableField', function(InventoryService) {
    return {
        restrict: 'E',
        scope: {
            field: '=',
            isDisabled: '=',
        },
        templateUrl: 'modules/workflows/views/fields/gtl-variable-field.html',
        link: function($scope, elem, attrs) {

        }
    }
});

app.directive('gtlOutputField', function(InventoryService) {
    return {
        restrict: 'E',
        scope: {
            field: '=',
            isDisabled: '=',
        },
        templateUrl: 'modules/workflows/views/fields/gtl-output-field.html',
        link: function($scope, elem, attrs) {
        }
    }
});

app.directive('gtlCalculationField', function(WorkflowService) {
    return {
        restrict: 'E',
        scope: {
            field: '=',
            isDisabled: '=',
        },
        templateUrl: 'modules/workflows/views/fields/gtl-calculation-field.html',
        link: function($scope, elem, attrs) {
        }
    }
});

app.directive('gtlStepField', function(InventoryService) {
    return {
        restrict: 'E',
        scope: {
            field: '=',
            isDisabled: '=',
            calculations: '='
        },
        templateUrl: 'modules/workflows/views/fields/gtl-step-field.html',
        link: function($scope, elem, attrs) {
            if(!$scope.field || !$scope.field.properties) {
                $scope.field = {
                    properties: []
                }
            } else {
                for(var i = 0; i < $scope.field.properties.length; i++) {
                    $scope.field.properties[i].mText = $scope.field.properties.measure;
                }
            }
        }
    }
});
