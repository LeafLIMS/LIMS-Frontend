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
                    item_type__name: lookupType,
                    search: filterText,
                    in_inventory: 'True',
                }
                return InventoryService.items(params);
            };

            $scope.setLookupItem = function(item) {
                $scope.field[$scope.field.store_value_in] = item.identifier;
            };

            if($scope.field.from_calculation) {
                var calc = _.find($scope.calculations, function(obj) {
                    return obj.id == $scope.field.calculation_used;
                });
                $scope.field.amount = calc.result; 
                $scope.calc = calc;
            }

            if($scope.field.from_input_file) {
                $scope.field[$scope.field.store_value_in] = '0';
            }

            $scope.$watch('field.amount', _.debounce(function(n,o) {
                if(n && n !== o && !$scope.field.from_calculation && !$scope.field.from_input_file) {
                    $rootScope.$broadcast('field-amount-changed', {
                        field: n, 
                    });
                }
            }, 500), true);

        }
    }
});

app.directive('gtlVariableField', function(InventoryService, $rootScope) {
    return {
        restrict: 'E',
        scope: {
            field: '=',
            isDisabled: '=',
        },
        templateUrl: 'modules/workflows/views/fields/gtl-variable-field.html',
        link: function($scope, elem, attrs) {
            $scope.$watch('field.amount', _.debounce(function(n,o) {
                console.log('hello', n, o);
                if(n && n !== o) {
                    $rootScope.$broadcast('field-amount-changed', {
                        field: n, 
                    });
                }
            }, 500), true);

        },
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
        },
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
        },
    }
});

app.directive('gtlStepField', function(InventoryService, $rootScope) {
    return {
        restrict: 'E',
        scope: {
            field: '=',
            isDisabled: '=',
            calculations: '=',
        },
        templateUrl: 'modules/workflows/views/fields/gtl-step-field.html',
        link: function($scope, elem, attrs) {
            if (!$scope.field || !$scope.field.properties) {
                $scope.field = {
                    properties: [],
                }
            } else {
                for (var i = 0; i < $scope.field.properties.length; i++) {
                    $scope.field.properties[i].mText = $scope.field.properties.measure;
                    if($scope.field.properties[i].from_calculation) {
                        var calc = _.find($scope.calculations, function(obj) {
                            return obj.id == $scope.field.properties[i].calculation_used;
                        });
                        $scope.field.properties[i].calc = calc;
                        $scope.field.properties[i].amount = calc.result; 
                    }
                }
            }

            for(var i = 0; i < $scope.field.properties.length; i++) {
                $scope.$watch('field.properties['+i+']', _.debounce(function(n,o) {
                    if(n && n !== o) {
                        $rootScope.$broadcast('field-amount-changed', {
                            field: n, 
                        });
                    }
                }, 500), true);
            }
        }
    }
});
