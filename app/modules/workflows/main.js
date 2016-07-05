'use strict';

var app = angular.module('limsFrontend');

app.controller('WorkflowsCtrl', function($scope, PageTitle, WorkflowService,
    $mdDialog, ProjectService, $rootScope, $q, $state, $stateParams) {

    PageTitle.set('Workflows');
    $scope.removePadding = true;

    var getActiveWorkflows = function() {
        WorkflowService.activeWorkflows().then(function(data) {
            $scope.activeWorkflows = data;
            if (data.length > 0 && !$state.params.id) {
                $state.go('app.workflows.workflow',
                        {id: data[0].id},
                        {location: 'replace'});
                $scope.selectedWorkflow = data[0].id;
            } else {
                $state.go('app.workflows.workflow',
                        {id: $state.params.id},
                        {location: 'replace'});
                $scope.selectedWorkflow = $stateParams.id;
            }
        });
    };
    getActiveWorkflows();

    var getNewWorkflow = function() {
        WorkflowService.activeWorkflows().then(function(data) {
            $scope.activeWorkflows = data;
            if (data.length > 0) {
                $state.go('app.workflows.workflow', {id: data[0].id});
                $scope.selectedWorkflow = data[0].id;
            }
        });
    };

    $rootScope.$on('workflow-added', getNewWorkflow);
    $rootScope.$on('workflow-completed', getNewWorkflow);
    $rootScope.$on('workflow-removed', getNewWorkflow);

    $scope.startWorkflow = function() {
        $mdDialog.show({
            templateUrl: 'modules/workflows/views/startworkflow.html',
            controller: 'startWorkflowCtrl',
            locals: {
                preSelected: false,
            },
        });
    };

});

app.controller('WorkflowSelectedCtrl', function($scope, PageTitle, WorkflowService,
    $mdDialog, ProjectService, $rootScope, $q, $state, $stateParams) {

    var getWorkflowData = function() {
        WorkflowService.fullActiveWorkflow($stateParams.id)
            .then(function(data) {
            $scope.selectedWorkflow = data;
            WorkflowService.workflowTasks(data.workflow).then(function(data) {
                $scope.workflowTasks = data;
            });
            $scope.selected = [];
            var groupedProducts = _.map(_.groupBy(data.product_statuses,
                function(obj) {
                    return obj.current_task + '|' + obj.run_identifier;
                }), function(obj, key) {
                    return [key, obj];
                });
            var max = _.maxBy(groupedProducts, function(obj) {
                return obj[1].length;
            });
            _.each(max[1], function(obj) {
                $scope.selected.push(obj);
            });
        }).catch(function() {
            $rootScope.$broadcast('workflow-removed');
        });
    };
    getWorkflowData();

    $rootScope.$on('workflow-updated', getWorkflowData);

    $scope.addToWorkflow = function(workflowId) {
        $mdDialog.show({
            templateUrl: 'modules/workflows/views/addtoworkflow.html',
            controller: 'addToWorkflowCtrl',
            locals: {
                workflowId: workflowId,
                products: $scope.products,
            },
        });
    };

    $scope.removeFromWorkflow = function(workflowId) {
        var d = $mdDialog.confirm()
            .title('Remove ' + $scope.selected.length + ' products from workflow?')
            .ariaLabel('Confirm remove products from workflow')
            .ok('Yes')
            .cancel('No');
        $mdDialog.show(d).then(function() {
            var promises = [];
            _.each($scope.selected, function(obj) {
                var p = WorkflowService.removeProduct(workflowId, obj.id)
                promises.push(p);
            });
            $q.all(promises).then(function(data) {
                $rootScope.$broadcast('workflow-updated');
            });
        });
    };

    $scope.switchWorkflow = function(workflowId) {
        $mdDialog.show({
            templateUrl: 'modules/workflows/views/switchworkflow.html',
            controller: 'switchWorkflowCtrl',
            locals: {
                items: $scope.selected,
                workflowId: workflowId,
            },
        });
    };

    $scope.deleteWorkflow = function(workflowId) {
        var confirmDelete = $mdDialog.confirm()
            .title('Are you sure you want to stop this workflow?')
            .ariaLabel('Confirm stop workflow')
            .ok('Stop')
            .cancel('No');
        $mdDialog.show(confirmDelete).then(function() {
            WorkflowService.deleteActiveWorkflow(workflowId)
                .then(function() {
                    $rootScope.$broadcast('workflow-removed');
                });
        });
    };

    $scope.selected = [];
    $scope.toggle = function(item, list) {
        _.each(_.clone(list), function(obj) {
            var itemStatus = item.current_task + '|' + item.run_identifier;
            var objStatus = obj.current_task + '|' + obj.run_identifier;
            if (obj.hasOwnProperty('current_task') && itemStatus !== objStatus) {
                var idx = list.indexOf(obj)
                list.splice(idx, 1);
            }
        });
        var idx = list.indexOf(item);
        if (idx > -1) {
            list.splice(idx, 1);
        } else {
            list.push(item);
        }
    };

    $scope.exists = function(item, list) {
        return list.indexOf(item) > -1;
    };

    $scope.showTask = function(item, isActive) {
        if (isActive) {
            $scope.showActiveTask(item.run_identifier, item.current_task);
        } else {
            $scope.doTask(item.taskPositionId);
        }
    }

    $scope.showActiveTask = function(runIdentifier, taskPositionId) {
        $mdDialog.show({
            templateUrl: 'modules/workflows/views/active_task.html',
            controller: 'showActiveTaskCtrl',
            locals: {
                runIdentifier: runIdentifier,
                taskPositionId: taskPositionId,
                selectedWorkflow: $scope.selectedWorkflow,
            },
        });
    };

    $scope.doTask = function(taskPositionId) {
        if (!taskPositionId) {
            taskPositionId = false;
        }
        $mdDialog.show({
            templateUrl: 'modules/workflows/views/task.html',
            controller: 'doTaskCtrl',
            locals: {
                taskPositionId: taskPositionId,
                workflowId: $scope.selectedWorkflow.workflow,
                selected: $scope.selected,
                selectedWorkflow: $scope.selectedWorkflow,
            },
        }).then(function() {
            $rootScope.$broadcast('workflow-updated');
        });
    };

});

app.controller('addToWorkflowCtrl', function($scope, $rootScope, $mdDialog,
            $q, WorkflowService, workflowId, products) {

    $scope.cancel = function() {
        $mdDialog.cancel();
    };

    $scope.productsSelected = [];

    $scope.add = function() {
        var promises = [];
        for (var i = 0; i < $scope.productsSelected.length; i++) {
            var productId = $scope.productsSelected[i].id;
            var p = WorkflowService.addProduct(workflowId, productId);
            promises.push(p);
        }
        $q.all(promises).then(function(data) {
            $rootScope.$broadcast('workflow-updated');
            $mdDialog.hide();
        });
    };

});

app.controller('switchWorkflowCtrl', function($scope, $rootScope, $mdDialog,
            WorkflowService, $q, items, workflowId) {

    $scope.workflowId = workflowId;

    $scope.cancel = function() {
        $mdDialog.cancel();
    }

    WorkflowService.activeWorkflows()
        .then(function(data) {
        _.each(data, function(obj, idx) {
            if (obj && obj.id === workflowId) {
                data.splice(idx, 1);
            }
        });
        $scope.activeWorkflows = data;
    });

    WorkflowService.availableWorkflows().then(function(data) {
        $scope.availableWorkflows = data;
    });

    $scope.change = function() {
        var promises = [];
        _.each(items, function(itm) {
            var params = {
                id: itm.id,
            };
            if ($scope.workflow) {
                params.workflow_id = $scope.workflow;
            }
            if ($scope.active_workflow) {
                params.active_workflow_id = $scope.active_workflow;
            }
            var p = WorkflowService.switchWorkflow(workflowId, params);
            promises.push(p);
        });
        $q.all(promises).then(function() {
            $rootScope.$broadcast('workflow-updated');
            $mdDialog.hide();
        });
    };
});

app.controller('startWorkflowCtrl', function($scope, WorkflowService,
        UserService, $mdDialog, $rootScope, $q, preSelected) {

    $scope.cancel = function() {
        $mdDialog.cancel();
    };

    WorkflowService.availableWorkflows().then(function(data) {
        $scope.availableWorkflows = data;
    });

    $scope.productsSelected = [];
    if (preSelected) {
        $scope.productsSelected = preSelected;
    }

    $scope.start = function() {
        $scope.workflow.started_by = UserService.getUser().username;
        WorkflowService.startWorkflow($scope.workflow).then(function(data) {
            if ($scope.productsSelected.length > 0) {
                var promises = [];
                for (var i = 0; i < $scope.productsSelected.length; i++) {
                    var productId = $scope.productsSelected[i].id;
                    var p = WorkflowService.addProduct(data.id, productId);
                    promises.push(p);
                }
                $q.all(promises).then(function(data) {
                    $rootScope.$broadcast('workflow-added');
                    $mdDialog.hide();
                });
            } else {
                $rootScope.$broadcast('workflow-added');
                $mdDialog.hide();
            }
        });
    };
});

app.controller('doTaskCtrl', function($scope, $rootScope, $mdDialog, UserService,
    WorkflowService, ProjectService, InventoryService, taskPositionId, workflowId,
    selected, selectedWorkflow) {

    $scope.product_inputs = [];
    $scope.components = [];
    $scope.selected = [];
    $scope.input_files = {};
    $scope.output_files = {};

    if (!taskPositionId) {
        taskPositionId = selected[0].current_task;
    }

    WorkflowService.getTaskByPosition(workflowId, taskPositionId)
        .then(function(data) {

            $scope.task = data;
            // The core fields - operations on these propogate through
            // to the individual component fields.
            if (selectedWorkflow.saved) {
                $scope.task = selectedWorkflow.saved;
            }

            $scope.selected = selected;

            var retrieve = _.reduce(selected, function(result, value) {
            if (result === '') {
                return result + value.product.id;
            }
            return result + ',' + value.product.id;
        }, '');

        });

    $scope.isStarted = selected[0].task_in_progress;

    $scope.cancel = $mdDialog.cancel;

    $scope.range = function(n) {
        return new Array(n);
    };

    $scope.filterLabwareItems = function(filterText, lookupType) {
        if (!lookupType) {
            lookupType = $scope.task.labware;
        }
        var params = {
            item_type__name: lookupType,
            search: filterText,
            in_inventory: 'True',
        }
        return InventoryService.items(params);
    };

    $scope.setLabwareItem = function(item) {
        $scope.task[$scope.task.store_labware_as] = item.identifier;
    };

    $scope.startTask = function(isPreview) {
        var params = {
            started_by: UserService.getUser().username,
            task: $scope.task,
            input_files: $scope.input_files,
            products: $scope.selected,
        }
        WorkflowService.startTask(selectedWorkflow.id, params, isPreview).then(function(data) {
            if (!isPreview) {
                $mdDialog.hide();
                $scope.isStarted = selected[0].task_in_progress;
            } else {
                $scope.requirements = data;
            }
        }).catch(function(err) {
            console.log(err);
            $scope.errorMessage = err.data.message;
        });
    };

    $scope.getRequirements = function() {
        $scope.startTask(true);
    };

    $scope.filterSelected = function(searchText) {
        return _.filter($scope.selected, function(obj) {
            var tl = obj.name.toLowerCase();
            var st = searchText.toLowerCase();
            return tl.indexOf(st) != -1;
        });
    };

    $scope.toggle = function(item, list) {
        var idx = list.indexOf(item);
        if (idx > -1) {
            list.splice(idx, 1);
        } else {
            list.push(item);
        }
    };

    $scope.exists = function(item, list) {
        return list.indexOf(item) > -1;
    };

});

app.controller('showActiveTaskCtrl', function($scope, $rootScope, $mdDialog, UserService,
    WorkflowService, ProjectService, InventoryService, runIdentifier,
    taskPositionId, selectedWorkflow) {

    $scope.product_inputs = [];
    $scope.components = [];
    $scope.selected = [];
    $scope.input_files = {};
    $scope.output_files = {};

    var getTaskData = function() {
        WorkflowService.getActiveTaskDetails(selectedWorkflow.id, runIdentifier, taskPositionId)
            .then(function(data) {

                $scope.task = data;
                $scope.selected = _.map(data.items, function(obj, key) {
                return obj[0].id;
            });
                if (Object.keys(data.items).length > 0) {
                    var first = Object.keys(data.items)[0];
                    $scope.table_column_headers = _.map(data.items[first][0].fields, function(obj) {
                    return obj.label;
                });
                }
            }).catch(function(err) {
            console.log(err);
            if (err.status == 410) {
                $rootScope.$broadcast('workflow-updated');
                $mdDialog.hide();
            }
        });
    };
    getTaskData();

    $scope.cancel = $mdDialog.cancel;

    $scope.completeAll = function() {
        var data = _.uniq(_.map($scope.task, function(obj) {
            return obj;
        }));
        WorkflowService.completeTask(selectedWorkflow.id, data).then(function() {
            $rootScope.$broadcast('workflow-updated');
            $mdDialog.hide();
        }).catch(function(err) {
            if (err.status == 410) {
                $rootScope.$broadcast('workflow-updated');
                $mdDialog.hide();
            }
        });
    };

    $scope.completeSelected = function() {
        var data = _.uniq(_.map($scope.selected, function(obj) {
            return obj;
        }));
        WorkflowService.completeTask(selectedWorkflow.id, data).then(function() {
            $rootScope.$broadcast('workflow-updated');
            getTaskData();
        }).catch(function(err) {
            if (err.status == 410) {
                $rootScope.$broadcast('workflow-updated');
                $mdDialog.hide();
            }
        });
    };

    $scope.retrySelected = function() {
        var data = _.uniq(_.map($scope.selected, function(obj) {
            return obj;
        }));
        WorkflowService.retryTask(selectedWorkflow.id, data).then(function() {
            $rootScope.$broadcast('workflow-updated');
            $mdDialog.hide();
        }).catch(function(err) {
            if (err.status == 410) {
                $rootScope.$broadcast('workflow-updated');
                $mdDialog.hide();
            }
        });
    };

    $scope.filterSelected = function(searchText) {
        return _.filter($scope.selected, function(obj) {
            var tl = obj.name.toLowerCase();
            var st = searchText.toLowerCase();
            return tl.indexOf(st) != -1;
        });
    };

    $scope.toggle = function(item, list) {
        var idx = list.indexOf(item);
        if (idx > -1) {
        list.splice(idx, 1); } else {
            list.push(item);
        }
    };

    $scope.exists = function(item, list) {
        return list.indexOf(item) > -1;
    };

});

app.controller('FullWorkflowCtrl', function($scope, PageTitle,
    ProjectService, WorkflowService, $stateParams, $mdDialog, $rootScope,
    $q, UserService) {

    $scope.removePadding = true;

    // MARKER
    var getWorkflowData = function() {
        WorkflowService.fullActiveWorkflow($stateParams.id).then(function(data) {
            $scope.workflow = data;
            PageTitle.set('Workflow: ');
        });
    };
    getWorkflowData();

    $rootScope.$on('workflow-updated', getWorkflowData);

    $scope.notOnWorkflow = function(value, index, array) {
        if (value.on_workflow.length > 0) {
            return false;
        }
        return true;
    };

    $scope.addToWorkflow = function(workflowId) {
        $mdDialog.show({
            templateUrl: 'modules/projects/views/addtoworkflow.html',
            controller: 'addToWorkflowCtrl',
            locals: {
                workflowId: workflowId,
                products: $scope.products,
            },
        });
    };

    $scope.removeFromWorkflow = function(workflowId, productId) {
        WorkflowService.removeProduct(workflowId, productId).then(function() {
            $rootScope.$broadcast('workflow-updated');
        });
    };

    $scope.switchWorkflow = function(item, workflowId) {
        $mdDialog.show({
            templateUrl: 'modules/projects/views/switchworkflow.html',
            controller: 'switchWorkflowCtrl',
            locals: {
                items: [item],
                workflowId: workflowId,
            },
        });
    };
});

app.directive('gtlSelectProduct', function(ProjectService) {
    return {
        restrict: 'E',
        scope: {
            productsList: '=',
        },
        templateUrl: 'modules/workflows/views/gtl-select-product.html',
        link: function($scope, elem, attr) {

            $scope.currentPage = 1;

            var productParams = {
                ordering: 'project,identifier',
                limit: 10,
                on_workflow: 'False',
                search: $scope.filterText,
            };

            $scope.getProducts = function(params) {
                productParams = _.merge(productParams, params);
                productParams.search = $scope.filterText;
                ProjectService.products(productParams).then(function(data) {
                    if (!$scope.currentPage) {
                        $scope.currentPage = data.meta.current;
                    }
                    $scope.nextPage = data.meta.next;
                    $scope.previousPage = data.meta.previous;
                    $scope.numPages = data.meta.pages;
                    $scope.productsAvailable = data;
                });
            };
            $scope.getProducts();

            $scope.$watch('filterText', function(n, o) {
                $scope.getProducts();
            });

            $scope.$watch('currentPage', function(n, o) {
                if (n && n != o) {
                    $scope.getProducts({page: n});
                }
            }, true);

            $scope.gotoNextPage = function() {
                $scope.currentPage += 1;
            };

            $scope.gotoPreviousPage = function() {
                $scope.currentPage -= 1;
            };

            $scope.selected = [];
            $scope.selectedToUse = [];

            $scope.selectAll = function() {
                _.each($scope.productsAvailable, function(obj) {
                    $scope.selected.push(obj);
                });
            };

            $scope.deselectAll = function() {
                _.each($scope.productsAvailable, function(obj) {
                    var idx = $scope.selected.indexOf(obj);
                    if (idx > -1) {
                        $scope.selected.splice(idx, 1);
                    }
                });
            };

            $scope.toggle = function(item, list) {
                var idx = list.indexOf(item);
                if (idx > -1) {
                    list.splice(idx, 1);
                } else {
                    list.push(item);
                }
            };

            $scope.exists = function(item, list) {
                return list.indexOf(item) > -1;
            };

            $scope.addToSelected = function() {
                _.each($scope.selected, function(obj) {
                    var idx = $scope.productsList.indexOf(obj);
                    if (idx == -1) {
                        $scope.productsList.push(obj);
                    }
                });
            };

            $scope.isEnabled = function(item, list) {
                return _.find(list, {id: item.id}) ? true : false;
            };

            $scope.removeItem = function() {
                _.each($scope.selectedToUse, function(obj) {
                    var idx = $scope.productsList.indexOf(obj);
                    if (idx > -1) {
                        $scope.productsList.splice(idx, 1);
                    }
                });
            };
        },
    }
});


app.directive('gtlWorkflowTaskPreview', function() {
    return {
        restrict: 'E',
        scope: {
            task: '=',
            taskNumber: '=',
            taskCount: '=',
            isSelected: '=',
        },
        templateUrl: 'modules/workflows/views/gmworkflowtaskpreview.html',
        link: function(scope, elem, attr) {
            scope.taskNum = scope.taskNumber + 1;
            if (attr.hasOwnProperty('current')) {
                scope.isCurrent = true;
            }
        },
    }
});

app.directive('gmProductListItem', function() {
    return {
        restrict: 'A',
        scope: {
            item: '=',
        },
        templateUrl: 'modules/workflows/views/gmproductlistitem.html',
        transclude: true,
    }
});

app.service('WorkflowService', function(Restangular) {

    this.availableWorkflows = function(params) {
        if (!params) {
            params = {};
        }
        return Restangular.all('workflows').getList(params);
    };

    this.getWorkflowWithTasks = function(workflowId) {
        return Restangular.one('workflows', workflowId).customGET('tasks');
    };

    this.saveWorkflowTemplate = function(workflowData) {
        return Restangular.all('workflows').post(workflowData);
    };

    this.updateWorkflowTemplate = function(workflowId, workflowData) {
        return Restangular.one('workflows', workflowId).patch(workflowData);
    };

    this.deleteWorkflowTemplate = function(workflowId) {
        return Restangular.one('workflows', workflowId).remove();
    };

    this.workflowTasks = function(workflowId) {
        return Restangular.one('workflows', workflowId).customGET('tasks');
    };

    this.activeWorkflows = function(params) {
        if (!params) {
            params = {};
        }
        return Restangular.all('activeworkflows').getList(params);
    };

    this.deleteActiveWorkflow = function(workflowId) {
        return Restangular.one('activeworkflows', workflowId).remove();
    };

    this.fullActiveWorkflow = function(workflowId) {
        return Restangular.one('activeworkflows', workflowId).get();
    };

    this.startWorkflow = function(data) {
        return Restangular.all('activeworkflows').post(data);
    };

    this.updateWorkflow = function(workflowId, data) {
        return Restangular.one('activeworkflows', workflowId).patch(data);
    };

    this.addProduct = function(workflowId, productId) {
        return Restangular.one('activeworkflows', workflowId).customPOST({},
            'add_product', {id: productId});
    };

    this.removeProduct = function(workflowId, productId) {
        return Restangular.one('activeworkflows', workflowId).customPOST({},
            'remove_product', {id: productId});
    };

    this.switchWorkflow = function(workflowId, params) {
        return Restangular.one('activeworkflows', workflowId).customPOST({},
            'switch_workflow', params);
    };

    this.recalculate = function(taskId, data) {
        return Restangular.one('tasks', taskId).customPOST(data, 'recalculate');
    };

    this.startTask = function(workflowId, data, isPreview) {
        var params = {};
        if (isPreview) {
            params.is_preview = 'True';
        }
        var frmData = new FormData();
        for (var key in data) {
            if (key !== 'input_files') {
                frmData.append(key, JSON.stringify(data[key]));
            } else {
                for (var fl in data.input_files) {
                    frmData.append(key, data.input_files[fl], fl);
                }
            }
        }
        return Restangular.one('activeworkflows', workflowId)
            .withHttpConfig({transformRequest: angular.identity})
            .customPOST(frmData, 'start_task', params, {
                'Content-Type': undefined,
            });
    };

    this.getActiveTaskDetails = function(workflowId, runIdentifier, taskPositionId) {
        return Restangular.one('activeworkflows', workflowId).customGET(
            'task_status', {run_identifier: runIdentifier, task_number: taskPositionId});
    };

    this.completeTask = function(workflowId, data) {
        return Restangular.one('activeworkflows', workflowId).customPOST(data,
            'complete_task');
    };

    this.retryTask = function(workflowId, data) {
        return Restangular.one('activeworkflows', workflowId).customPOST(data,
            'retry_task');
    };

    this.availableTasks = function(params) {
        if (!params) {
            params = {};
        }
        return Restangular.all('tasks').getList(params);
    };

    this.availableTaskTypes = function() {
        return Restangular.all('tasks').customGETLIST('task_types');
    };

    this.getTaskByPosition = function(workflowId, taskPositionId) {
        return Restangular.one('workflows', workflowId)
            .customGET('task_details', {position: taskPositionId});
    };

    this.task = function(taskId) {
        return Restangular.one('tasks', taskId).get();
    };

    this.saveTaskTemplate = function(templateData) {
        return Restangular.all('tasks').post(templateData);
    };

    this.updateTaskTemplate = function(taskId, templateData) {
        return Restangular.one('tasks', taskId).patch(templateData);
    };

    this.deleteTaskTemplate = function(taskId) {
        return Restangular.one('tasks', taskId).remove();
    };

    this.saveTaskField = function(taskFieldData, fieldType) {
        return Restangular.all('taskfields').post(taskFieldData, {type: fieldType});
    };

    this.updateTaskField = function(fieldId, taskFieldData, fieldType) {
        return Restangular.one('taskfields', fieldId).patch(taskFieldData, {type: fieldType});
    };

    this.deleteTaskField = function(fieldId, fieldType) {
        return Restangular.one('taskfields', fieldId).remove({type: fieldType});
    };

});
