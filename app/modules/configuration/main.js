'use strict';

var app = angular.module('limsFrontend');

app.controller('ConfigurationCtrl', function($scope, PageTitle, UserService) {

    PageTitle.set('Configuration');
    $scope.removePadding = true;

    $scope.crmEnabled = UserService.getUser().crmEnabled;

    $scope.availableConfigs = [
        {
            name: 'Projects',
            sections: [
                {
                    name: 'Workflow templates',
                    ctrl: 'Workflows',
                    show: true,
                },
                {
                    name: 'Workflow task templates',
                    ctrl: 'WorkflowTasks',
                    show: true,
                },
                {
                    name: 'Product statuses',
                    ctrl: 'ProductStatuses',
                    show: true,
                },
            ],
        },
        {
            name: 'Inventory',
            sections: [
                {
                    name: 'Item types',
                    ctrl: 'ItemType',
                    show: true,
                },
                {
                    name: 'Measures',
                    ctrl: 'Measures',
                    show: true,
                },
                {
                    name: 'Locations',
                    ctrl: 'Locations',
                    show: true,
                },
                {
                    name: 'Organisms',
                    ctrl: 'Organisms',
                    show: true,
                },
                {
                    name: 'Price books',
                    ctrl: 'Pricebooks',
                    show: $scope.crmEnabled,
                },
            ],
        },
        {
            name: 'Alerts',
            sections: [
                {
                    name: 'Triggers',
                    ctrl: 'Triggers',
                    show: true,
                },
            ],
        },
        {
            name: 'Equipment',
            sections: [
                {
                    name: 'Available equipment',
                    ctrl: 'Equipment',
                    show: true,
                },
            ],
        },
        {
            name: 'Files and drivers',
            sections: [
                {
                    name: 'File templates',
                    ctrl: 'FileTemplates',
                    show: true,
                },
                {
                    name: 'File copy actions',
                    ctrl: 'FileCopy',
                    show: true,
                },
            ],
        },
        {
            name: 'Users and permissions',
            sections: [
                {
                    name: 'Users',
                    ctrl: 'Users',
                    show: true,
                },
                {
                    name: 'Groups',
                    ctrl: 'Groups',
                    show: true,
                },
            ],
        },
    ];

});

app.controller('WorkflowsConfigurationCtrl', function($scope, PageTitle,
            WorkflowService, $mdDialog) {
    PageTitle.set('Workflow templates configuration');

    $scope.selected = [];

    $scope.query = {
        ordering: '-created_on',
        limit: 10,
    };

    var refreshData = function() {
        WorkflowService.availableWorkflows($scope.query).then(function(data) {
            $scope.workflows = data;
        });
    };
    refreshData();

    WorkflowService.availableTasks().then(function(data) {
        $scope.availableTasks = data;
    });

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

    $scope.createWorkflowTemplate = function() {
        $mdDialog.show({
            templateUrl: 'modules/configuration/views/createworkflowtemplate.html',
            controller: 'WorkflowDialogCtrl',
            locals: {
                tasks: $scope.availableTasks,
                workflowId: undefined,
            },
        }).then(function() {
            refreshData();
        });
    };

    $scope.editItem = function(workflowId) {
        $mdDialog.show({
            templateUrl: 'modules/configuration/views/createworkflowtemplate.html',
            controller: 'WorkflowDialogCtrl',
            locals: {
                tasks: $scope.availableTasks,
                workflowId: workflowId,
            },
        }).then(function() {
            refreshData();
        });
    };

    $scope.deleteItem = function(workflowId) {
        var confirmDelete = $mdDialog.confirm()
            .title('Are you sure you want to delete this workflow?')
            .ariaLabel('Confirm delete this item')
            .ok('Delete')
            .cancel('Cancel');
        $mdDialog.show(confirmDelete).then(function() {
            WorkflowService.deleteWorkflowTemplate(workflowId)
                .then(function() {
                    refreshData();
                });
        });
    };

    $scope.duplicateItem = function(item) {
        item.id = undefined;
        item.name = item.name + ' (copy)';
        WorkflowService.saveWorkflowTemplate(item).then(function() {
            refreshData();
        });
    };

});

app.controller('WorkflowDialogCtrl', function($scope, $mdDialog,
    WorkflowService, UserService, tasks, workflowId) {

    var getWorkflow = function(workflowId) {
        if (workflowId) {
            WorkflowService.workflowTasks(workflowId).then(function(data) {
                $scope.order = [];
                var order = data.order.split(',');
                if (order[0] !== '') {
                    _.each(order, function(taskId) {
                        $scope.order.push(_.find(data.tasks, function(obj) {
                            return obj.id == taskId;
                        }));
                    });
                }
                $scope.workflow = data;
            });
        } else {
            $scope.workflow = {};
            $scope.order = [];
        }
    };
    getWorkflow(workflowId);

    $scope.addTask = function() {
        if ($scope.selectedTask) {
            $scope.order.push($scope.selectedTask);
            $scope.taskSearchText = '';
            $scope.selectedTask = undefined;
        }
    };

    $scope.queryTasks = function(searchText) {
        searchText = searchText.toLowerCase();
        return _.filter(tasks, function(obj) {
            if (obj.name.toLowerCase().indexOf(searchText) > -1) {
                return obj;
            }
        });
    };

    $scope.removeTask = function(index) {
        $scope.order.splice(index, 1);
    };

    $scope.save = function() {
        var order = _.map($scope.order, 'id').join(',');

        $scope.workflow.order = order;
        if (!workflowId) {
            $scope.workflow.created_by = UserService.getUser().username;
        }
        if (workflowId) {
            WorkflowService.updateWorkflowTemplate(workflowId, $scope.workflow).then(function() {
                $mdDialog.hide();
            });
        } else {
            WorkflowService.saveWorkflowTemplate($scope.workflow).then(function() {
                $mdDialog.hide();
            });
        }
    };

    $scope.cancel = function() {
        $mdDialog.cancel();
    };
});

app.controller('WorkflowTasksConfigurationCtrl', function($scope, PageTitle, WorkflowService,
            $mdDialog, $rootScope) {
    PageTitle.set('Workflow task templates configuration');

    $scope.query = {
        ordering: '-created_on',
        limit: 10,
    };

    var refreshData = function(params) {
        WorkflowService.availableTasks($scope.query).then(function(data) {
            $scope.tasks = data;
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

    $scope.createWorkflowTaskTemplate = function() {
        $mdDialog.show({
            templateUrl: 'modules/configuration/views/createtasktemplate.html',
            controller: 'WorkflowTasksDialogCtrl',
            locals: {
                taskId: undefined,
            },
        }).then(function() {
            refreshData();
        });
    };

    $scope.editItem = function(taskId) {
        $mdDialog.show({
            templateUrl: 'modules/configuration/views/createtasktemplate.html',
            controller: 'WorkflowTasksDialogCtrl',
            locals: {
                taskId: taskId,
            },
        }).then(function() {
            refreshData();
        });
    };

    $scope.deleteItem = function(taskId) {
        var confirmDelete = $mdDialog.confirm()
            .title('Are you sure you want to delete this task?')
            .ariaLabel('Confirm delete this item')
            .ok('Delete')
            .cancel('Cancel');
        $mdDialog.show(confirmDelete).then(function() {
            WorkflowService.deleteTaskTemplate(taskId)
                .then(function() {
                    refreshData();
                });
        });
    };

    $scope.duplicateItem = function(item) {
        item.id = undefined;
        item.name = item.name + ' (copy)';
        WorkflowService.saveTaskTemplate(item).then(function() {
            refreshData();
        });
    };

});

app.controller('WorkflowTasksDialogCtrl', function($scope, $mdDialog,
    WorkflowService, InventoryService, UserService,
    EquipmentService, FileTemplateService, ErrorService, taskId) {

    if (taskId) {
        WorkflowService.task(taskId).then(function(data) {
            $scope.task = data;
            $scope.inputSearchText = $scope.task.product_input;
            $scope.mText = $scope.task.product_input_measure;
            $scope.lbText = $scope.task.labware;
        });
    } else {
        $scope.task = {
            capable_equipment: [],
            input_files: [],
            output_files: [],
            equipment_files: [],
        };
    }

    $scope.transformChip = function(chip) {
        if (angular.isObject(chip)) {
            return chip.name;
        }
        return chip;
    };

    InventoryService.measures({limit: 100}).then(function(data) {
        $scope.measures = data;
    });

    $scope.filterInputTypes = function(filterText) {
        return InventoryService.itemTypes({search: filterText});
    };

    $scope.filterEquipment = function(filterText) {
        return EquipmentService.equipment({search: filterText});
    };

    $scope.filterFileTemplates = function(filterText, fileType) {
        return FileTemplateService.templates({search: filterText, file_for: fileType});
    };

    $scope.filterMeasures = function(filterText) {
        return InventoryService.measures({search: filterText});
    };

    $scope.setMeasure = function(item) {
        $scope.task.product_input_measure = item.symbol;
    };

    $scope.setLabware = function(item) {
        $scope.task.labware = item.name;
    };

    $scope.addField = function(fieldType) {
        $scope.task[fieldType + '_fields'].push({});
    };

    $scope.saveField = function(fieldType, field) {
        field.template = $scope.task.id;
        WorkflowService.saveTaskField(field, fieldType).then(function(data) {
            field.id = data.id;
        });
    };

    $scope.updateField = function(fieldType, field, frm) {
        WorkflowService.updateTaskField(field.id, field, fieldType).then(function() {
            frm.$setPristine();
        });
    };

    $scope.removeField = function(fieldType, index, isSaved) {
        if (isSaved) {
            var field = $scope.task[fieldType + '_fields'][index];
            WorkflowService.deleteTaskField(field.id, fieldType);
        }
        $scope.task[fieldType + '_fields'].splice(index, 1);
    };

    $scope.saveAddFields = function() {
        $scope.task.product_input = $scope.inputSelected.name;
        $scope.task.created_by = UserService.getUser().username;
        WorkflowService.saveTaskTemplate($scope.task).then(function(data) {
            $scope.task = data;
            taskId = data.id;
        }).catch(function(err) {
            $scope.message = ErrorService.parseError(err);
        });
    };

    $scope.save = function() {
        $scope.task.product_input = $scope.inputSelected.name;
        if (taskId) {
            WorkflowService.updateTaskTemplate(taskId, $scope.task).then(function() {
                $mdDialog.hide();
            });
        } else {
            WorkflowService.saveTaskTemplate($scope.task).then(function() {
                $mdDialog.hide();
            });
        }
    };

    $scope.cancel = function() {
        $mdDialog.cancel();
    };
});

app.controller('MeasuresConfigurationCtrl', function($scope, PageTitle,
            InventoryService, $mdDialog) {
    PageTitle.set('Measures configuration');

    $scope.selectedItems = [];

    $scope.query = {
        ordering: '-created_on',
        limit: 10,
    };

    var refreshData = function() {
        InventoryService.measures($scope.query).then(function(data) {
            $scope.measures = data;
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

    $scope.createMeasure = function() {
        $mdDialog.show({
            templateUrl: 'modules/configuration/views/createmeasure.html',
            controller: 'MeasureDialogCtrl',
            locals: {
                measureId: undefined,
            },
        }).then(function() {
            refreshData();
        });
    };

    $scope.editItem = function(measureId) {
        $mdDialog.show({
            templateUrl: 'modules/configuration/views/createmeasure.html',
            controller: 'MeasureDialogCtrl',
            locals: {
                measureId: measureId,
            },
        }).then(function() {
            refreshData();
        });
    };

    $scope.deleteItem = function(measureId) {
        var confirmDelete = $mdDialog.confirm()
            .title('Are you sure you want to delete this measure?')
            .ariaLabel('Confirm delete this item')
            .ok('Delete')
            .cancel('Cancel');
        $mdDialog.show(confirmDelete).then(function() {
            InventoryService.deleteMeasure(measureId)
                .then(function() {
                    refreshData();
                });
        });
    };

});

app.controller('MeasureDialogCtrl', function($scope, $mdDialog,
    InventoryService, UserService, measureId) {

    var getMeasure = function(measureId) {
        if (measureId) {
            InventoryService.getMeasure(measureId).then(function(data) {
                $scope.measure = data;
            });
        } else {
            $scope.measure = {};
        }
    };
    getMeasure(measureId);

    $scope.save = function() {
        if (measureId) {
            InventoryService.updateMeasure(measureId, $scope.measure).then(function() {
                $mdDialog.hide();
            });
        } else {
            InventoryService.saveMeasure($scope.measure).then(function() {
                $mdDialog.hide();
            });
        }
    };

    $scope.cancel = function() {
        $mdDialog.cancel();
    };
});

app.controller('ItemTypeConfigurationCtrl', function($scope, PageTitle,
            InventoryService, $mdDialog) {
    PageTitle.set('Item types configuration');

    $scope.selectedItems = [];

    var getAvailableItemTypes = function() {
        InventoryService.itemTypes({limit: 500}).then(function(data) {
            $scope.itemtypes = data;
            _.each($scope.itemtypes, function(obj) {
                obj.show = true;
                obj.expanded = true;
            });
        });
    };
    getAvailableItemTypes();

    $scope.showChildren = function(item) {
        // Go through until hit same level!!
        // from index until level == item.level
        var index = _.indexOf($scope.itemtypes, item);
        $scope.itemtypes[index].expanded = true;
        for (var i = index + 1; i < $scope.itemtypes.length; i++) {
            if ($scope.itemtypes[i].level == item.level) {
                break;
            }
            if ($scope.itemtypes[i].level == $scope.itemtypes[index].level + 1) {
                $scope.itemtypes[i].show = true;
            }
        }
    };

    $scope.hideChildren = function(item) {
        var index = _.indexOf($scope.itemtypes, item);
        console.log(index);
        $scope.itemtypes[index].expanded = false;
        for (var i = index + 1; i < $scope.itemtypes.length; i++) {
            if ($scope.itemtypes[i].level == item.level) {
                break;
            }
            $scope.itemtypes[i].show = false;
            $scope.itemtypes[i].expanded = false;
        }
    };

    $scope.createItemType = function() {
        $mdDialog.show({
            templateUrl: 'modules/configuration/views/createitemtype.html',
            controller: 'ItemTypeDialogCtrl',
            locals: {
                itemtypes: $scope.itemtypes,
                itemtypeId: undefined,
            },
        }).then(function() {
            getAvailableItemTypes();
        });
    };

    $scope.editItem = function(itemtypeId) {
        $mdDialog.show({
            templateUrl: 'modules/configuration/views/createitemtype.html',
            controller: 'ItemTypeDialogCtrl',
            locals: {
                itemtypes: $scope.itemtypes,
                itemtypeId: itemtypeId,
            },
        }).then(function() {
            getAvailableItemTypes();
        });
    };

    $scope.deleteItem = function(itemtypeId) {
        var confirmDelete = $mdDialog.confirm()
            .title('Are you sure you want to delete this item type?')
            .ariaLabel('Confirm delete this item')
            .ok('Delete')
            .cancel('Cancel');
        $mdDialog.show(confirmDelete).then(function() {
            InventoryService.deleteItemType(itemtypeId)
                .then(function() {
                    getAvailableItemTypes();
                });
        });
    };

});

app.controller('ItemTypeDialogCtrl', function($scope, $mdDialog,
    InventoryService, UserService, itemtypes, itemtypeId) {

    var getItemType = function(itemtypeId) {
        if (itemtypeId) {
            InventoryService.getItemType(itemtypeId).then(function(data) {
                $scope.itemtype = data;
                $scope.selectedItem = _.find(itemtypes, {name: data.parent});
            });
        } else {
            $scope.itemtype = {};
        }
    };
    getItemType(itemtypeId);

    // Ng-show when open == parent
    $scope.setParent = function() {
        if ($scope.selectedItem) {
            $scope.itemtype.parent = $scope.selectedItem.name;
        }
    };

    $scope.queryItems = function(searchText) {
        searchText = searchText.toLowerCase();
        return _.filter(itemtypes, function(obj) {
            if (obj.level > 0) {
                obj.pad = new Array(obj.level + 1).join(' -- ');
            }
            if (obj.name.toLowerCase().indexOf(searchText) > -1) {
                return obj;
            }
        });
    };

    $scope.save = function() {
        if (itemtypeId) {
            InventoryService.updateItemType(itemtypeId, $scope.itemtype).then(function() {
                $mdDialog.hide();
            });
        } else {
            InventoryService.saveItemType($scope.itemtype).then(function() {
                $mdDialog.hide();
            });
        }
    };

    $scope.cancel = function() {
        $mdDialog.cancel();
    };
});

app.controller('LocationsConfigurationCtrl', function($scope, PageTitle,
            InventoryService, $mdDialog) {
    PageTitle.set('Locations configuration');

    $scope.selectedItems = [];

    var getAvailableLocations = function() {
        InventoryService.locations({limit: 200}).then(function(data) {
            $scope.locations = data;
            _.each($scope.locations, function(obj) {
                obj.show = true;
                obj.expanded = true;
            });
        });
    };
    getAvailableLocations();

    $scope.showChildren = function(item) {
        // Go through until hit same level!!
        // from index until level == item.level
        var index = _.indexOf($scope.locations, item);
        $scope.locations[index].expanded = true;
        for (var i = index + 1; i < $scope.locations.length; i++) {
            if ($scope.locations[i].level == item.level) {
                break;
            }
            if ($scope.locations[i].level == $scope.locations[index].level + 1) {
                $scope.locations[i].show = true;
            }
        }
    };

    $scope.hideChildren = function(item) {
        var index = _.indexOf($scope.locations, item);
        $scope.locations[index].expanded = false;
        for (var i = index + 1; i < $scope.locations.length; i++) {
            if ($scope.locations[i].level == item.level) {
                break;
            }
            $scope.locations[i].show = false;
            $scope.locations[i].expanded = false;
        }
    };

    $scope.createLocation = function() {
        $mdDialog.show({
            templateUrl: 'modules/configuration/views/createlocation.html',
            controller: 'LocationDialogCtrl',
            locals: {
                locations: $scope.locations,
                locationId: undefined,
            },
        }).then(function() {
            getAvailableLocations();
        });
    };

    $scope.editItem = function(locationId) {
        $mdDialog.show({
            templateUrl: 'modules/configuration/views/createlocation.html',
            controller: 'LocationDialogCtrl',
            locals: {
                locations: $scope.locations,
                locationId: locationId,
            },
        }).then(function() {
            getAvailableLocations();
        });
    };

    $scope.deleteItem = function(locationId) {
        var confirmDelete = $mdDialog.confirm()
            .title('Are you sure you want to delete this location?')
            .ariaLabel('Confirm delete this item')
            .ok('Delete')
            .cancel('Cancel');
        $mdDialog.show(confirmDelete).then(function() {
            InventoryService.deleteLocation(locationId)
                .then(function() {
                    getAvailableLocations();
                });
        });
    };

});

app.controller('LocationDialogCtrl', function($scope, $mdDialog,
    InventoryService, UserService, locations, locationId) {

    console.log(locations, locationId);

    var getLocation = function(locationId) {
        if (locationId) {
            InventoryService.getLocation(locationId).then(function(data) {
                $scope.location = data;
                $scope.selectedItem = _.find(locations, {code: data.parent});
            });
        } else {
            $scope.location = {};
        }
    };
    getLocation(locationId);

    // Ng-show when open == parent
    $scope.setParent = function() {
        if ($scope.selectedItem) {
            $scope.location.parent = $scope.selectedItem.code;
        }
    };

    $scope.queryItems = function(searchText) {
        searchText = searchText.toLowerCase();
        return _.filter(locations, function(obj) {
            if (obj.level > 0) {
                obj.pad = new Array(obj.level + 1).join(' -- ');
            }
            if (obj.name.toLowerCase().indexOf(searchText) > -1) {
                return obj;
            }
        });
    };

    $scope.save = function() {
        if (locationId) {
            InventoryService.updateLocation(locationId, $scope.location).then(function() {
                $mdDialog.hide();
            });
        } else {
            InventoryService.saveLocation($scope.location).then(function() {
                $mdDialog.hide();
            });
        }
    };

    $scope.cancel = function() {
        $mdDialog.cancel();
    };
});

app.controller('OrganismsConfigurationCtrl', function($scope, PageTitle,
            OrganismService, $mdDialog) {
    PageTitle.set('Organisms configuration');

    $scope.query = {
        ordering: 'name',
        limit: 10,
    };

    var refreshData = function() {
        OrganismService.organisms($scope.query).then(function(data) {
            $scope.organisms = data;
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

    $scope.createOrganism = function() {
        $mdDialog.show({
            templateUrl: 'modules/configuration/views/createorganism.html',
            controller: 'OrganismDialogCtrl',
            locals: {
                organismId: undefined,
            },
        }).then(function() {
            refreshData();
        });
    };

    $scope.editItem = function(organismId) {
        $mdDialog.show({
            templateUrl: 'modules/configuration/views/createorganism.html',
            controller: 'OrganismDialogCtrl',
            locals: {
                organismId: organismId,
            },
        }).then(function() {
            refreshData();
        });
    };

    $scope.deleteItem = function(organismId) {
        var confirmDelete = $mdDialog.confirm()
            .title('Are you sure you want to delete this organism?')
            .ariaLabel('Confirm delete this item')
            .ok('Delete')
            .cancel('Cancel');
        $mdDialog.show(confirmDelete).then(function() {
            OrganismService.deleteOrganism(organismId)
                .then(function() {
                    refreshData();
                });
        });
    };

});

app.controller('OrganismDialogCtrl', function($scope, $mdDialog,
    OrganismService, UserService, CRMService, organismId) {

    var getOrganism = function(organismId) {
        if (organismId) {
            OrganismService.getOrganism(organismId).then(function(data) {
                $scope.organism = data;
            });
        } else {
            $scope.organism = {};
        }
    };
    getOrganism(organismId);

    $scope.save = function() {
        if (organismId) {
            OrganismService.updateOrganism(organismId, $scope.organism).then(function() {
                $mdDialog.hide();
            });
        } else {
            OrganismService.saveOrganism($scope.organism).then(function() {
                $mdDialog.hide();
            });
        }
    };

    $scope.cancel = function() {
        $mdDialog.cancel();
    };
});

app.controller('PricebooksConfigurationCtrl', function($scope, PageTitle,
            PricebookService, $mdDialog) {
    PageTitle.set('Pricebooks configuration');

    $scope.query = {
        ordering: 'name',
        limit: 10,
    };

    var refreshData = function() {
        PricebookService.pricebooks($scope.query).then(function(data) {
            $scope.pricebooks = data;
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

    $scope.updatePricebooks = function() {
        PricebookService.updateAllPricebooks().then(function() {
            refreshData();
        });
    };

    $scope.createPricebook = function() {
        $mdDialog.show({
            templateUrl: 'modules/configuration/views/createpricebook.html',
            controller: 'PricebookDialogCtrl',
            locals: {
                pricebookId: undefined,
            },
        }).then(function() {
            refreshData();
        });
    };

    $scope.editItem = function(pricebookId) {
        $mdDialog.show({
            templateUrl: 'modules/configuration/views/createpricebook.html',
            controller: 'PricebookDialogCtrl',
            locals: {
                pricebookId: pricebookId,
            },
        }).then(function() {
            refreshData();
        });
    };

    $scope.deleteItem = function(pricebookId) {
        var confirmDelete = $mdDialog.confirm()
            .title('Are you sure you want to delete this pricebook?')
            .ariaLabel('Confirm delete this item')
            .ok('Delete')
            .cancel('Cancel');
        $mdDialog.show(confirmDelete).then(function() {
            PricebookService.deletePricebook(pricebookId)
                .then(function() {
                    refreshData();
                });
        });
    };

});

app.controller('PricebookDialogCtrl', function($scope, $mdDialog,
    PricebookService, UserService, CRMService, pricebookId) {

    var getPricebook = function(pricebookId) {
        if (pricebookId) {
            PricebookService.getPricebook(pricebookId).then(function(data) {
                $scope.pricebook = data.identifier;
            });
        } else {
            $scope.pricebook = {};
        }
    };
    getPricebook(pricebookId);

    PricebookService.listCRMPricebooks().then(function(data) {
        $scope.crmPricebooks = data;
    });

    $scope.save = function() {
        var pricebook = _.find($scope.crmPricebooks, function(obj) {
            return obj.Id == $scope.pricebook;
        });
        var data = {
            name: pricebook.Name,
            identifier: pricebook.Id,
        };
        if (pricebookId) {
            PricebookService.updatePricebook(pricebookId, data).then(function() {
                $mdDialog.hide();
            });
        } else {
            PricebookService.savePricebook(data).then(function() {
                $mdDialog.hide();
            }).catch(function(err) {
                $scope.error = 'Invalid price book';
            });
        }
    };

    $scope.cancel = function() {
        $mdDialog.cancel();
    };
});

app.controller('UsersConfigurationCtrl', function($scope, PageTitle,
            UserService, CRMService, $mdDialog, $q) {
    PageTitle.set('Users configuration');

    $scope.crmEnabled = UserService.getUser().crmEnabled;

    $scope.selected = [];

    $scope.query = {
        ordering: 'id',
        limit: 10,
    };

    var refreshData = function() {
        UserService.users($scope.query).then(function(data) {
            $scope.users = data;
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

    $scope.createUser = function() {
        $mdDialog.show({
            templateUrl: 'modules/configuration/views/createuser.html',
            controller: 'UserDialogCtrl',
            locals: {
                userId: undefined,
            },
        }).then(function() {
            refreshData();
        });
    };

    $scope.refreshUserCRM = function(selected) {
        var promises = [];
        _.each(selected, function(item) {
            if (item.crmaccount) {
                var accountId = [item.crmaccount.id];
                var p = CRMService.updateAccounts(accountId);
                promises.push(p);
            }
        });
        $q.all(promises).then(function(data) {
            refreshData();
        });
    };

    $scope.linkUserCRM = function(selected) {
        var promises = [];
        _.each(selected, function(item) {
            if (!item.crmaccount) {
                var p = CRMService.addAccount(item.email);
                promises.push(p);
            }
        });
        $q.all(promises).then(function(data) {
            refreshData();
        });
    };

    $scope.editItem = function(userId) {
        $mdDialog.show({
            templateUrl: 'modules/configuration/views/createuser.html',
            controller: 'UserDialogCtrl',
            locals: {
                userId: userId,
            },
        }).then(function() {
            refreshData();
        });
    };

    $scope.changePassword = function(userId) {
        $mdDialog.show({
            templateUrl: 'modules/configuration/views/changepassword.html',
            controller: function($scope, $mdDialog, UserService, userId) {
                $scope.cancel = $mdDialog.cancel;

                $scope.changePassword = function() {
                    UserService.changePassword(userId, $scope.new_password).then(function(data) {
                        $mdDialog.hide();
                    });
                };
            },
            locals: {
                userId: userId,
            },
        }).then(function() {
            refreshData();
        });
    };

    $scope.deleteItem = function(userId) {
        var confirmDelete = $mdDialog.confirm()
            .title('Are you sure you want to delete this user?')
            .ariaLabel('Confirm delete this item')
            .ok('Delete')
            .cancel('Cancel');
        $mdDialog.show(confirmDelete).then(function() {
            UserService.deleteUser(userId)
                .then(function() {
                    refreshData();
                });
        });
    };

});

app.controller('UserDialogCtrl', function($scope, $mdDialog,
    UserService, GroupService, CRMService, userId) {

    $scope.crmEnabled = UserService.getUser().crmEnabled;

    GroupService.groups({limit: 200}).then(function(data) {
        $scope.groups = data;
    });

    $scope.getItems = function(searchText) {
        var st = searchText.toLowerCase();
        return _.filter($scope.groups, function(obj) {
            return obj.name.toLowerCase().indexOf(st) > -1;
        });
    };

    $scope.addGroup = function() {
        if ($scope.selectedItem) {
            if (!$scope.user.groups) {
                $scope.user.groups = [];
            }
            if ($scope.user.groups.indexOf($scope.selectedItem.name) == -1) {
                $scope.user.groups.push($scope.selectedItem.name);
            }
            $scope.selectedItem = undefined;
            $scope.searchText = undefined;
        }
    };

    $scope.removeGroup = function(name) {
        var loc = $scope.user.groups.indexOf(name);
        $scope.user.groups.splice(loc, 1);
    };

    var getUser = function(userId) {
        if (userId) {
            UserService.getUserDetails(userId).then(function(data) {
                $scope.user = data;
            });
        } else {
            $scope.user = {};
        }
    };
    getUser(userId);

    $scope.addCRMAccount = function() {
        if (!$scope.user.crmaccount && $scope.user.email) {
            CRMService.addAccount($scope.user.email).then(function(data) {
                $scope.user.crmaccount = data.crmaccount;
            }).catch(function(err) {
                $scope.error = err;
            });
        }
    };

    $scope.removeCRMAccount = function() {
        CRMService.removeAccount($scope.user.email).then(function(data) {
            $scope.user.crmaccount = undefined;
        });
    };

    $scope.save = function() {
        if ($scope.user.password === '') {
            delete $scope.user.password;
        }
        if (userId) {
            UserService.updateUserDetails(userId, $scope.user).then(function() {
                $mdDialog.hide();
            });
        } else {
            UserService.saveUser($scope.user).then(function() {
                $mdDialog.hide();
            });
        }
    };

    $scope.cancel = function() {
        $mdDialog.cancel();
    };
});

app.controller('GroupsConfigurationCtrl', function($scope, PageTitle,
            GroupService, $mdDialog) {
    PageTitle.set('Groups configuration');

    $scope.query = {
        ordering: 'name',
        limit: 10,
    };

    var refreshData = function() {
        GroupService.groups($scope.query).then(function(data) {
            $scope.groups = data;
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

    $scope.createGroup = function() {
        $mdDialog.show({
            templateUrl: 'modules/configuration/views/creategroup.html',
            controller: 'GroupDialogCtrl',
            locals: {
                groupId: undefined,
            },
        }).then(function() {
            refreshData();
        });
    };

    $scope.editItem = function(groupId) {
        $mdDialog.show({
            templateUrl: 'modules/configuration/views/creategroup.html',
            controller: 'GroupDialogCtrl',
            locals: {
                groupId: groupId,
            },
        }).then(function() {
            refreshData();
        });
    };

    $scope.duplicateItem = function(item) {
        var newItem = _.cloneDeep(item);
        newItem.name = newItem.name + ' (copy)';
        delete newItem.id;
        GroupService.saveGroup(newItem)
            .then(function() {
                refreshData();
            });
    };

    $scope.deleteItem = function(groupId) {
        var confirmDelete = $mdDialog.confirm()
            .title('Are you sure you want to delete this group?')
            .ariaLabel('Confirm delete this item')
            .ok('Delete')
            .cancel('Cancel');
        $mdDialog.show(confirmDelete).then(function() {
            GroupService.deleteGroup(groupId)
                .then(function() {
                    refreshData();
                });
        });
    };

});

app.controller('GroupDialogCtrl', function($scope, $mdDialog,
    GroupService, groupId) {

    $scope.selectedItem;
    $scope.permissions = [];
    GroupService.permissions({limit: 200}).then(function(data) {
        _.each(data, function(obj) {
            $scope.permissions.push(obj.name);
        });
    });

    GroupService.groups().then(function(data) {
        $scope.groups = data;
    });

    $scope.getItems = function(searchText) {
        var st = searchText.toLowerCase();
        return _.filter($scope.groups, function(obj) {
            return obj.name.toLowerCase().indexOf(st) > -1;
        });
    };

    $scope.setGroup = function() {
        $scope.group.permissions = $scope.selectedItem.permissions;
    };

    var getGroup = function(groupId) {
        if (groupId) {
            GroupService.getGroup(groupId).then(function(data) {
                $scope.group = data;
            });
        } else {
            $scope.group = {};
            $scope.group.permissions = [];
        }
    };
    getGroup(groupId);

    $scope.save = function() {
        if (groupId) {
            GroupService.updateGroup(groupId, $scope.group).then(function() {
                $mdDialog.hide();
            });
        } else {
            GroupService.saveGroup($scope.group).then(function() {
                $mdDialog.hide();
            });
        }
    };

    $scope.cancel = function() {
        $mdDialog.cancel();
    };
});

app.controller('EquipmentConfigurationCtrl', function($scope, PageTitle,
            EquipmentService, $mdDialog) {
    PageTitle.set('Equipment configuration');

    $scope.query = {
        ordering: 'name',
        limit: 10,
    };

    var refreshData = function() {
        EquipmentService.equipment($scope.query).then(function(data) {
            $scope.equipments = data;
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

    $scope.createEquipment = function() {
        $mdDialog.show({
            templateUrl: 'modules/configuration/views/createequipment.html',
            controller: 'EquipmentDialogCtrl',
            locals: {
                equipmentId: undefined,
            },
        }).then(function() {
            refreshData();
        });
    };

    $scope.editItem = function(equipmentId) {
        $mdDialog.show({
            templateUrl: 'modules/configuration/views/createequipment.html',
            controller: 'EquipmentDialogCtrl',
            locals: {
                equipmentId: equipmentId,
            },
        }).then(function() {
            refreshData();
        });
    };

    $scope.deleteItem = function(equipmentId) {
        var confirmDelete = $mdDialog.confirm()
            .title('Are you sure you want to delete this equipment?')
            .ariaLabel('Confirm delete this item')
            .ok('Delete')
            .cancel('Cancel');
        $mdDialog.show(confirmDelete).then(function() {
            EquipmentService.deleteEquipment(equipmentId)
                .then(function() {
                    refreshData();
                });
        });
    };

});

app.controller('EquipmentDialogCtrl', function($scope, $mdDialog,
    EquipmentService, InventoryService, equipmentId) {

    InventoryService.locations({limit: 200}).then(function(data) {
        $scope.locations = data;
    });

    $scope.getItems = function(searchText) {
        var st = searchText.toLowerCase();
        return _.filter($scope.equipments, function(obj) {
            return obj.name.toLowerCase().indexOf(st) > -1;
        });
    };

    var getEquipment = function(equipmentId) {
        if (equipmentId) {
            EquipmentService.getEquipment(equipmentId).then(function(data) {
                $scope.equipment = data;
            });
        } else {
            $scope.equipment = {};
            $scope.equipment.permissions = [];
        }
    };
    getEquipment(equipmentId);

    $scope.save = function() {
        if (equipmentId) {
            EquipmentService.updateEquipment(equipmentId, $scope.equipment).then(function() {
                $mdDialog.hide();
            });
        } else {
            $scope.equipment.status = 'idle';
            EquipmentService.saveEquipment($scope.equipment).then(function() {
                $mdDialog.hide();
            });
        }
    };

    $scope.cancel = function() {
        $mdDialog.cancel();
    };
});

app.controller('FileTemplatesConfigurationCtrl', function($scope, PageTitle,
            FileTemplateService, $mdDialog) {
    PageTitle.set('File template configuration');

    $scope.query = {
        ordering: 'name',
        limit: 10,
    };

    var refreshData = function() {
        FileTemplateService.templates($scope.query).then(function(data) {
            $scope.filetemplates = data;
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

    $scope.createFileTemplate = function() {
        $mdDialog.show({
            templateUrl: 'modules/configuration/views/createfiletemplate.html',
            controller: 'FileTemplatesDialogCtrl',
            locals: {
                filetemplateId: undefined,
            },
        }).then(function() {
            refreshData();
        });
    };

    $scope.fileTemplateWizard = function() {
        $mdDialog.show({
            templateUrl: 'modules/configuration/views/filetemplatewizard.html',
            controller: 'FileTemplateWizardCtrl',
            locals: {
                filetemplateId: undefined,
            },
        }).then(function() {
            refreshData();
        });
    };

    $scope.editItem = function(filetemplateId) {
        $mdDialog.show({
            templateUrl: 'modules/configuration/views/createfiletemplate.html',
            controller: 'FileTemplatesDialogCtrl',
            locals: {
                filetemplateId: filetemplateId,
            },
        }).then(function() {
            refreshData();
        });
    };

    $scope.duplicateItem = function(item) {
        var newItem = _.cloneDeep(item);
        newItem.name = newItem.name + ' (copy)';
        delete newItem.id;
        FileTemplateService.saveTemplate(newItem)
            .then(function() {
                refreshData();
            });
    };

    $scope.deleteItem = function(filetemplateId) {
        var confirmDelete = $mdDialog.confirm()
            .title('Are you sure you want to delete this filetemplate?')
            .ariaLabel('Confirm delete this item')
            .ok('Delete')
            .cancel('Cancel');
        $mdDialog.show(confirmDelete).then(function() {
            FileTemplateService.deleteTemplate(filetemplateId)
                .then(function() {
                    refreshData();
                });
        });
    };

});

app.controller('FileTemplatesDialogCtrl', function($scope, $mdDialog,
    FileTemplateService, InventoryService, filetemplateId) {

    InventoryService.locations({limit: 200}).then(function(data) {
        $scope.locations = data;
    });

    $scope.getItems = function(searchText) {
        var st = searchText.toLowerCase();
        return _.filter($scope.filetemplates, function(obj) {
            return obj.name.toLowerCase().indexOf(st) > -1;
        });
    };

    var getFileTemplate = function(filetemplateId) {
        if (filetemplateId) {
            FileTemplateService.getTemplate(filetemplateId).then(function(data) {
                $scope.filetemplate = data;
            });
        } else {
            $scope.filetemplate = {};
            $scope.filetemplate.fields = [];
        }
    };
    getFileTemplate(filetemplateId);

    $scope.addField = function() {
        $scope.filetemplate.fields.push({name: ''});
    };

    $scope.removeField = function(index) {
        if ($scope.filetemplate.fields.length == 1) {
            $scope.filetemplate.fields = [];
        } else {
            $scope.filetemplate.fields.splice(index, 1);
        }
    };

    $scope.save = function() {
        if (filetemplateId) {
            FileTemplateService.updateTemplate(filetemplateId, $scope.filetemplate)
                .then(function() {
                $mdDialog.hide();
            });
        } else {
            FileTemplateService.saveTemplate($scope.filetemplate).then(function() {
                $mdDialog.hide();
            });
        }
    };

    $scope.cancel = function() {
        $mdDialog.cancel();
    };
});


app.controller('FileTemplateWizardCtrl', function($scope, $mdDialog,
    FileTemplateService, InventoryService, WorkflowService) {

    $scope.taskFields = [
        'product_identifier',
        'inventory_identifier',
        'product_input_amount',
        'product_input_measure',
    ];

    $scope.inventoryFields = [
        'name',
        'identifier',
        'barcode',
        'description',
        'item_type',
        'amount_available',
        'amount_measure',
        'location',
    ];

    $scope.filetemplate = {
        fields: [],
    };

    WorkflowService.availableTasks().then(function(data) {
        $scope.tasks = data;
    });

    $scope.getTaskFields = function(task) {
        WorkflowService.getTask(task.id).then(function(data) {
            _.each(data.input_fields, function(obj) {
                $scope.taskFields.push(obj.label);
            });
        });
    };

    $scope.addField = function() {
        $scope.filetemplate.fields.push({name: ''});
    };

    $scope.removeField = function(index) {
        if ($scope.filetemplate.fields.length == 1) {
            $scope.filetemplate.fields = [];
        } else {
            $scope.filetemplate.fields.splice(index, 1);
        }
    };

    $scope.setFileFor = function(fileFor) {
        if (fileFor == 'inventory') {
            $scope.fields = $scope.inventoryFields;
        } else if (fileFor == 'tasks') {
            $scope.fields = $scope.taskFields;
        }
    };

    $scope.setDefaultFields = function(fileFor, fileType) {
        if (fileType == 'input' && fileFor == 'tasks') {
            $scope.filetemplate.fields.push({
                name: 'product identifier',
                map_to: 'product_identifier',
                required: true,
                is_identifier: true,
            }, {
                name: 'inventory identifier',
                map_to: 'inventory_identifier',
                required: true,
                is_identifier: true,
            });
        } else if (fileType == 'input' && fileFor == 'inventory') {
            $scope.filetemplate.fields.push({
                name: 'barcode',
                map_to: 'barcode',
                required: true,
                is_identifier: true,
            }, {
                name: 'name',
                map_to: 'name',
                required: true,
            });
        }
    };

    $scope.save = function() {
        FileTemplateService.saveTemplate($scope.filetemplate).then(function() {
            $mdDialog.hide();
        });
    };

    $scope.cancel = $mdDialog.cancel;
});


app.controller('FileCopyConfigurationCtrl', function($scope, PageTitle,
            FileCopyService, $mdDialog) {
    PageTitle.set('File copy configuration');

    $scope.query = {
        ordering: 'name',
        limit: 10,
    };

    var refreshData = function() {
        FileCopyService.copyfiles($scope.query).then(function(data) {
            $scope.copyfiles = data;
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

    $scope.createFileCopy = function() {
        $mdDialog.show({
            templateUrl: 'modules/configuration/views/createcopyfile.html',
            controller: 'FileCopyDialogCtrl',
            locals: {
                copyfileId: undefined,
            },
        }).then(function() {
            refreshData();
        });
    };

    $scope.editItem = function(copyfileId) {
        $mdDialog.show({
            templateUrl: 'modules/configuration/views/createcopyfile.html',
            controller: 'FileCopyDialogCtrl',
            locals: {
                copyfileId: copyfileId,
            },
        }).then(function() {
            refreshData();
        });
    };

    $scope.duplicateItem = function(item) {
        var newItem = _.cloneDeep(item);
        newItem.name = newItem.name + ' (copy)';
        delete newItem.id;
        FileCopyService.saveTemplate(newItem)
            .then(function() {
                refreshData();
            });
    };

    $scope.deleteItem = function(filetemplateId) {
        var confirmDelete = $mdDialog.confirm()
            .title('Are you sure you want to delete this filetemplate?')
            .ariaLabel('Confirm delete this item')
            .ok('Delete')
            .cancel('Cancel');
        $mdDialog.show(confirmDelete).then(function() {
            FileCopyService.deleteTemplate(filetemplateId)
                .then(function() {
                    refreshData();
                });
        });
    };

});

app.controller('FileCopyDialogCtrl', function($scope, $mdDialog,
    FileCopyService, EquipmentService, copyfileId) {

    EquipmentService.equipment().then(function(data) {
        $scope.equipment = data;
    });

    $scope.getItems = function(searchText) {
        var st = searchText.toLowerCase();
        return _.filter($scope.copyfiles, function(obj) {
            return obj.name.toLowerCase().indexOf(st) > -1;
        });
    };

    var getCopyFile = function(copyfileId) {
        if (copyfileId) {
            FileCopyService.getCopyFile(copyfileId).then(function(data) {
                $scope.copyfile = data;
            });
        } else {
            $scope.copyfile = {};
            $scope.copyfile.locations = [];
        }
    };
    getCopyFile(copyfileId);

    $scope.addLocation = function() {
        $scope.copyfile.locations.push({name: ''});
    };

    $scope.removeLocation = function(index) {
        if ($scope.copyfile.locations.length == 1) {
            $scope.copyfile.locations = [];
        } else {
            $scope.copyfile.locations.splice(index, 1);
        }
    };

    $scope.save = function() {
        if (copyfileId) {
            FileCopyService.updateCopyFile(copyfileId, $scope.copyfile)
                .then(function() {
                $mdDialog.hide();
            });
        } else {
            FileCopyService.saveCopyFile($scope.copyfile).then(function() {
                $mdDialog.hide();
            });
        }
    };

    $scope.cancel = $mdDialog.cancel;

});

app.controller('ProductStatusesConfigurationCtrl', function($scope, PageTitle,
            ProjectService, $mdDialog) {
    PageTitle.set('ProductStatuses configuration');

    $scope.selectedItems = [];

    $scope.query = {
        ordering: '-created_on',
        limit: 10,
    };

    var refreshData = function() {
        ProjectService.productStatuses($scope.query).then(function(data) {
            $scope.productstatuses = data;
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

    $scope.createProductStatus = function() {
        $mdDialog.show({
            templateUrl: 'modules/configuration/views/createproductstatus.html',
            controller: 'ProductStatusesDialogCtrl',
            locals: {
                productstatusesId: undefined,
            },
        }).then(function() {
            refreshData();
        });
    };

    $scope.editItem = function(productstatusesId) {
        $mdDialog.show({
            templateUrl: 'modules/configuration/views/createproductstatus.html',
            controller: 'ProductStatusesDialogCtrl',
            locals: {
                productstatusesId: productstatusesId,
            },
        }).then(function() {
            refreshData();
        });
    };

    $scope.deleteItem = function(productstatusesId) {
        var confirmDelete = $mdDialog.confirm()
            .title('Are you sure you want to delete this product status?')
            .ariaLabel('Confirm delete this item')
            .ok('Delete')
            .cancel('Cancel');
        $mdDialog.show(confirmDelete).then(function() {
            ProjectService.deleteProductStatuses(productstatusesId)
                .then(function() {
                    refreshData();
                });
        });
    };

});

app.controller('ProductStatusesDialogCtrl', function($scope, $mdDialog,
    ProjectService, UserService, productstatusesId) {

    var getProductStatuses = function(productstatusesId) {
        if (productstatusesId) {
            ProjectService.getProductStatus(productstatusesId).then(function(data) {
                $scope.productstatuses = data;
            });
        } else {
            $scope.productstatuses = {};
        }
    };
    getProductStatuses(productstatusesId);

    $scope.save = function() {
        if (productstatusesId) {
            ProjectService.updateProductStatuses(productstatusesId,
                                                 $scope.productstatuses).then(function() {
                $mdDialog.hide();
            });
        } else {
            ProjectService.saveProductStatuses($scope.productstatuses).then(function() {
                $mdDialog.hide();
            });
        }
    };

    $scope.cancel = function() {
        $mdDialog.cancel();
    };
});
