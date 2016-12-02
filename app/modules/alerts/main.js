'use strict';

var app = angular.module('limsFrontend');

app.controller('TriggersConfigurationCtrl', function($scope, PageTitle, $mdDialog,
            AlertService) {

    PageTitle.set('Alert trigger configuration');

    $scope.query = {
        ordering: 'name',
        limit: 10,
    };

    var refreshData = function() {
        AlertService.triggersets($scope.query).then(function(data) {
            $scope.triggers = data;
        });
    };
    refreshData();

    $scope.onPaginateItems = function(page, limit) {
        $scope.query.page = page;
        $scope.query.limit = limit;
        refreshData();
    };

    $scope.$watch('query.search', function(n, o) {
        if (n !== o) {
            refreshData();
        }
    }, true);

    $scope.createTrigger = function() {
        $mdDialog.show({
            templateUrl: 'modules/configuration/views/createtrigger.html',
            controller: 'TriggerDialogCtrl',
            locals: {
                triggerId: undefined,
            },
        }).then(function() {
            refreshData();
        });
    };

    $scope.editItem = function(triggerId) {
        $mdDialog.show({
            templateUrl: 'modules/configuration/views/createtrigger.html',
            controller: 'TriggerDialogCtrl',
            locals: {
                triggerId: triggerId,
            },
        }).then(function() {
            refreshData();
        });
    };

    $scope.deleteItem = function(triggerId) {
        var confirmDelete = $mdDialog.confirm()
            .title('Are you sure you want to delete this trigger?')
            .ariaLabel('Confirm delete this item')
            .ok('Delete')
            .cancel('Cancel');
        $mdDialog.show(confirmDelete).then(function() {
            AlertService.deleteTriggerset(triggerId)
                .then(function() {
                    refreshData();
                });
        });
    };

});

app.controller('TriggerDialogCtrl', function($scope, $mdDialog,
    AlertService, UserService, triggerId) {

    $scope.conditions = [];
    $scope.subscriptions = [];

    $scope.models = [
        {model: 'Item', endpoint: 'inventory'},
        {model: 'Set', endpoint: 'inventorysets'},
        {model: 'Project', endpoint: 'projects'},
        {model: 'Product', endpoint: 'products'},
        {model: 'Run', endpoint: 'runs'},
        {model: 'Equipment', endpoint: 'equipment'},
        {model: 'Task', endpoint: 'tasks'},
        {model: 'Workflow', endpoint: 'workflows'},
        {model: 'EquipmentReservation', endpoint: 'equipmentreservation'},
    ];

    $scope.operators = [
        {value: '<', name: 'less than'},
        {value: '<=', name: 'less than or equal to'},
        {value: '==', name: 'equal to'},
        {value: '>=', name: 'greater than or equal to'},
        {value: '>', name: 'greater than'},
        {value: '!=', name: 'not equal to'},
    ];

    UserService.users({limit: 200}).then(function(data) {
        $scope.users = data;
    });

    var getTrigger = function(triggerId) {
        if (triggerId) {
            AlertService.getTriggerset(triggerId).then(function(data) {
                $scope.trigger = data;
                $scope.setConditionFields(data.model);
                AlertService.getTriggers(triggerId).then(function(tdata) {
                    $scope.conditions = tdata;
                });
                AlertService.getSubscriptions(triggerId).then(function(sdata) {
                    $scope.subscriptions = sdata;
                });
            });
        } else {
            $scope.trigger = {};
        }
    };
    getTrigger(triggerId);

    var parseFields = function(fieldData) {
        var fields = [];
        _.each(fieldData['actions']['POST'], function(field, fieldName) {
            if (!field.read_only) {
                fields.push(fieldName);
            }
        });
        return fields;
    };

    $scope.setConditionFields = function(model) {
        console.log(model);
        var modelData = _.find($scope.models, {model: model});
        AlertService.getModelFields(modelData.endpoint).then(function(data) {
            $scope.conditionFields = parseFields(data);
        });
    };

    var saveConditions = function(triggersetId) {
        if ($scope.conditions.length > 0) {
            _.each($scope.conditions, function(obj) {
                if (!obj.id) {
                    obj.triggerset_id = triggersetId;
                    AlertService.saveTrigger(obj);
                } else {
                    AlertService.updateTrigger(obj.id, obj);
                }
            });
        }
    };

    var saveSubscriptions = function(triggersetId) {
        if ($scope.subscriptions.length > 0) {
            _.each($scope.subscriptions, function(obj) {
                if (!obj.id) {
                    obj.triggerset_id = triggersetId;
                    AlertService.saveSubscription(obj);
                } else {
                    AlertService.updateSubscription(obj.id, obj);
                }
            });
        }
    };

    $scope.save = function() {
        if (triggerId) {
            AlertService.updateTriggerset(triggerId, $scope.trigger).then(function(data) {
                saveConditions(data.id);
                saveSubscriptions(data.id);
                $mdDialog.hide();
            });
        } else {
            AlertService.saveTriggerset($scope.trigger).then(function(data) {
                saveConditions(data.id);
                saveSubscriptions(data.id);
                $mdDialog.hide();
            });
        }
    };

    $scope.addCondition = function() {
        $scope.conditions.push({});
    };

    $scope.addSubscription = function() {
        $scope.subscriptions.push({});
    };

    $scope.deleteCondition = function(index) {
        var condId = $scope.conditions[index].id;
        if (condId) {
            AlertService.deleteTrigger(condId).then(function() {
                $scope.conditions.splice(index, 1);
            });
        } else {
            $scope.conditions.splice(index, 1);
        }
    };

    $scope.deleteSubscription = function(index) {
        var subId = $scope.subscriptions[index].id;
        if (subId) {
            AlertService.deleteSubscription(subId).then(function() {
                $scope.subscriptions.splice(index, 1);
            });
        } else {
            $scope.subscriptions.splice(index, 1);
        }

    };

    $scope.cancel = function() {
        $mdDialog.cancel();
    };
});

app.service('AlertService', function(Restangular) {

    this.triggersets = function(params) {
        if (!params) {
            var params = {};
        }
        return Restangular.all('triggersets').getList(params);
    };

    this.getTriggerset = function(triggerId) {
        return Restangular.one('triggersets', triggerId).get();
    };

    this.triggers = function(params) {
        if (!params) {
            var params = {};
        }
        return Restangular.all('triggers').getList(params);
    };

    this.saveTriggerset = function(data) {
        return Restangular.all('triggersets').post(data);
    };

    this.updateTriggerset = function(triggersetId, data) {
        return Restangular.one('triggersets', triggersetId).patch(data);
    };

    this.getTriggers = function(triggerId) {
        return Restangular.one('triggersets', triggerId).customGETLIST('triggers');
    };

    this.saveTrigger = function(data) {
        return Restangular.all('triggers').post(data);
    };

    this.updateTrigger = function(triggerId, data) {
        return Restangular.one('triggers', triggerId).patch(data);
    };

    this.deleteTrigger = function(triggerId) {
        return Restangular.one('triggers', triggerId).remove();
    };

    this.getSubscriptions = function(triggerId) {
        return Restangular.one('triggersets', triggerId).customGETLIST('subscriptions');
    };

    this.saveSubscription = function(data) {
        return Restangular.all('subscriptions').post(data);
    };

    this.updateSubscription = function(subscriptionId, data) {
        return Restangular.one('subscriptions', subscriptionId).patch(data);
    };

    this.deleteSubscription = function(subId) {
        return Restangular.one('subscriptions', subId).remove();
    };

    this.getModelFields = function(model) {
        return Restangular.all(model).options();
    };

});
