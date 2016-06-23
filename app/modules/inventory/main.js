'use strict';

var app = angular.module('limsFrontend');

app.controller('InventoryCtrl', function($scope, PageTitle, InventoryService,
    $mdDialog, $q) {

    PageTitle.set('Inventory');
    $scope.removePadding = true;

    $scope.query = {
        in_inventory: 'True',
        ordering: 'name',
        limit: 10
    };

    $scope.set_query = {
        ordering: 'name',
        limit: 10
    };

    $scope.selectedItems = [];
    $scope.selectedSets = [];

    $scope.refreshItemData = function() {
        InventoryService.items($scope.query).then(function(data) {
            $scope.items = data;
            if(!$scope.hasFilter('in_inventory')) {
                $scope.filters = 'All items in inventory';
            } else {
                $scope.filters = undefined;
            }
        });
    };
    $scope.refreshItemData();

    $scope.refreshSetData = function() {
        InventoryService.sets($scope.set_query).then(function(data) {
            $scope.inventorysets = data;
        });
    };
    $scope.refreshSetData();

    $scope.hasFilter = function(fieldName, scopeQueryName) {
        if(!scopeQueryName)
            var scopeQueryName = 'query'
        if(fieldName in $scope[scopeQueryName]) {
            return true;
        }
        return false;
    };

    $scope.$watch('query.search', function(n,o) {
        if(n !== o) {
            $scope.refreshItemData();
        }
    });

    $scope.toggleFilter = function(fieldName, value) {
        // If value == undefined then boolean toggle
        if(fieldName in $scope.query) {
            delete $scope.query[fieldName]
        } else {
            if(!value) {
                var value = 'True';
            }
            $scope.query[fieldName] = value;
        }
        $scope.refreshItemData();
    };

    $scope.onSortItems = function(order) {
        $scope.query.ordering = order;
        $scope.refreshItemData();
    };

    $scope.onPaginateItems = function(page, limit) {
        $scope.query.page = page;
        $scope.query.limit = limit;
        $scope.refreshItemData();
    };

    $scope.$watch('set_query.search', function(n,o) {
        if(n !== o) {
            $scope.refreshSetData();
        }
    });

    $scope.toggleSetFilter = function(fieldName, value) {
        // If value == undefined then boolean toggle
        if(fieldName in $scope.set_query) {
            delete $scope.set_query[fieldName]
        } else {
            if(!value) {
                var value = 'True';
            }
            $scope.set_query[fieldName] = value;
        }
        $scope.refreshSetData();
    };

    $scope.onSortSet = function(order) {
        $scope.set_query.ordering = order;
        $scope.refreshSetData();
    };

    $scope.onPaginateSets = function(page, limit) {
        $scope.set_query.page = page;
        $scope.set_query.limit = limit;
        $scope.refreshSetData();
    };

    $scope.addItem = function() {
        $mdDialog.show({
            templateUrl: 'modules/inventory/views/additem.html',
            controller: 'AddItemCtrl',
        }).then(function() {
            $scope.refreshItemData();
        });
    };

    $scope.importItems = function() {
        $mdDialog.show({
            templateUrl: 'modules/inventory/views/importitems.html',
            controller: 'ImportItemsCtrl',
        });
    };

    $scope.createSet = function() {
        $mdDialog.show({
            templateUrl: 'modules/inventory/views/createset.html',
            controller: 'CreateSetCtrl',
        }).then(function() {
            $scope.refreshSetData()
        });
    };

    $scope.deleteItems = function(selected) {
        var d = $mdDialog.confirm()
            .title('Delete '+selected.length+' items?')
            .ok('Delete')
            .cancel('No');
        $mdDialog.show(d).then(function() {
            var promises = [];
            _.each(selected, function(obj) {
                var p = InventoryService.deleteItem(obj.id);
                promises.push(p);
            });
            $q.all(promises).then(function(data) {
                $scope.refreshItemData();
            });
        });
    };

    $scope.addToSet = function(selected) {
        $mdDialog.show({
            templateUrl: 'modules/inventory/views/addtoset.html',
            controller: function($scope, InventoryService, selected, sets) {

                $scope.sets = sets;

                $scope.cancel = function() {
                    $mdDialog.hide();
                };

                $scope.add = function() {
                    var promises = [];
                    _.each(selected, function(obj) {
                        var p = InventoryService.addToSet($scope.setId, obj.id);
                        promises.push(p);
                    });
                    $q.all(promises).then(function(){
                        $mdDialog.hide();
                    });
                };
            },
            locals: {
                selected: selected,
                sets: $scope.inventorysets
            }
        }).then(function() {
            $scope.refreshSetData();
        });
    };

});

app.controller('AddItemCtrl', function($scope, $mdDialog, InventoryService, 
        UserService, OrganismService) {

    $scope.item = {
        properties: [],
    };
    $scope.item.usage = 0;

    $scope.cancel = function() {
        $mdDialog.hide();
    };

    InventoryService.locations({limit: 100}).then(
        function(data) {
            $scope.locations = data;
        });

    InventoryService.itemTypes({limit: 100}).then(
        function(data) {
            $scope.item_types = data;
        });

    InventoryService.measures({limit: 100}).then(
        function(data) {
            $scope.measures = data;
        });

    OrganismService.organisms({limit: 100}).then(
        function(data) {
            $scope.organisms = data;
        });

    $scope.searchItemTypes = function(searchText) {
        if(!searchText) {
            return $scope.item_types;
        }
        var lSearchText = searchText.toLowerCase();
        var results = _.filter($scope.item_types, function(itm) {
            return itm.name.toLowerCase().indexOf(lSearchText) > -1;
        });
        return results;
    };

    $scope.addProperty = function() {
        $scope.item.properties.push({name: '', value: ''});
    };

    $scope.removeProperty = function(index) {
        if($scope.item.properties.length == 1) {
            $scope.item.properties = [];
        } else {
            $scope.item.properties.splice(1, index);
        }
    };

    $scope.add = function() {
        $scope.item.added_by = UserService.getUser().username;
        $scope.item.item_type = $scope.selectedItemType.name;
        InventoryService.saveItem($scope.item).then(
            function(data) {
                $mdDialog.hide();
            });
    };

});

app.controller('ImportItemsCtrl', function($scope, $mdDialog, InventoryService) { 

    $scope.cancel = function() {
        $mdDialog.cancel();
    };

    $scope.add = function() {
        var params = new FormData();
        params.append('items_file', $scope.items_file);
        InventoryService.importItems(params).then(function(data) {
            if(data.rejected.length > 0) {
                $mdDialog.show({
                    templateUrl: 'modules/inventory/views/rejecteditems.html',
                    controller: function($scope, $mdDialog, rejected) {
                        $scope.rejected = rejected;
                        $scope.hide = function() {
                            $mdDialog.hide();
                        };
                    },
                    locals: {
                        rejected: data.rejected
                    }
                });
            } else {
                $mdDialog.hide();
            }
        });
    };

});

app.controller('CreateSetCtrl', function($scope, $mdDialog, InventoryService) {

    $scope.cancel = function() {
        $mdDialog.cancel();
    };

    $scope.add = function() {
        InventoryService.saveSet($scope.set).then(function() {
            $mdDialog.hide();
        });
    };

});

app.controller('InventoryItemCtrl', function($scope, PageTitle, 
    InventoryService, $stateParams, $mdDialog, $state, InventoryActions, 
    $timeout, OrganismService) {

    $scope.removePadding = true;

    var getDetails = function() {
        InventoryService.item_details($stateParams.id).then(function(data) {
            $scope.item = data;
            PageTitle.set('Item: ' + $scope.item.name);
        });
    };
    getDetails();

    InventoryService.locations({limit: 100}).then(
        function(data) {
            $scope.locations = data;
        });

    InventoryService.measures({limit: 100}).then(
        function(data) {
            $scope.measures = data;
        });

    OrganismService.organisms({limit: 100}).then(
        function(data) {
        $scope.organisms = data;
    });

    var timeout = null;
    var doUpdate = function() {
        if($scope.inventoryItemForm.$valid) {
            InventoryService.updateItem($stateParams.id, $scope.item);
        } else {
            console.log('INVALID');
        }
    };

    var debounceUpdate = function(n, o) {
        if(n !== o && o !== undefined) {
            if(timeout) {
                $timeout.cancel(timeout);
            }
            timeout = $timeout(doUpdate, 1000);
        }
    };

    $scope.$watch('item', debounceUpdate, true);

    $scope.makeChip = function(chip) {
        if(angular.isObject(chip)) {
            return chip;
        }
        return {name: chip, type: 'new'}
    };

    $scope.queryTags = function(searchText) {
        return $scope.item.tags;
    };

    $scope.completeTransfer = function(transfer) {
        InventoryService.completeTransfer(transfer.item, transfer.id)
            .then(function() {
                getDetails();
            });
    };

    $scope.dispense = function() {
        $mdDialog.show({
            templateUrl: 'modules/inventory/views/dispense.html',
            controller: function($scope, $mdDialog, InventoryService, itemId, itemMeasure) {
                
                $scope.cancel = $mdDialog.cancel;

                $scope.measure = itemMeasure;

                $scope.dispense = function() {
                    InventoryService.createTransfer(itemId, $scope.transfer)
                        .then(function() {
                            $mdDialog.hide();
                        });
                };
            },
            locals: {
                itemId: $scope.item.id,
                itemMeasure: $scope.item.amount_measure,
            }
        }).then(function() {
            getDetails();
        });
    };

    $scope.unstock = function() {
        InventoryActions.unstock($stateParams.id, $scope.item);
    };

    $scope.restock = function() {
        InventoryActions.restock($scope.item)
        .then(function() {
            InventoryService.item_details($stateParams.id).then(function(data) {
                $scope.item = data;
            });
        });
    };

    $scope.delete = function() {
        var confirmDelete = $mdDialog.confirm()
            .title('Delete '+$scope.item.name+'?')
            .ariaLabel('Confirm deletion of '+$scope.item.name)
            .ok('Delete')
            .cancel('Cancel');
        $mdDialog.show(confirmDelete).then(function() {
            InventoryService.deleteItem($stateParams.id).then(function() {
                $state.go('app.inventory');
            });
        });
    };

});

app.controller('SetCtrl', function($scope, InventoryService, $stateParams, 
        PageTitle, $mdDialog, $q) {

    $scope.removePadding = true;
    $scope.selectedItems = [];

    var getInventoryItems = function() {
        InventoryService.getSetItems($stateParams.id).then(function(data) {
            $scope.items = data;
        });
    };

    InventoryService.getSet($stateParams.id).then(function(data) {
        $scope.set = data;
        PageTitle.set('Set: ' + $scope.set.name);
        getInventoryItems();
    });

    $scope.deleteItems = function(selected) {
        var d = $mdDialog.confirm()
            .title('Remove '+selected.length+' item(s) from set?')
            .ok('Remove')
            .cancel('No');
        $mdDialog.show(d).then(function() {
            var promises = [];
            _.each(selected, function(obj) {
                var p = InventoryService.removeFromSet($stateParams.id, obj.id);
                promises.push(p);
            });
            $q.all(promises).then(function(data) {
                getInventoryItems();
            });
        });
    };
});

app.service('InventoryActions', function(Restangular, InventoryService, $mdDialog) {

    this.unstock = function(id, item) {
        item.amount_available = 0;
        item.in_inventory = false;
    };

    this.restock = function(item) {
        return $mdDialog.show({
            templateUrl: 'modules/inventory/views/restock.html',
            controller: function(scope, $mdDialog, InventoryService, 
                item) {

                scope.item = item;

                scope.restock = function() {
                    var data = {
                        'amount': scope.amount, 
                        'is_addition': true,
                    };
                    InventoryService.createTransfer(item.id, data).then(function() {
                        $mdDialog.hide();
                    });
                };

                scope.cancel = function() {
                    $mdDialog.cancel();
                };
            },
            locals: {
                item: item,
            }
        });
    };
});

app.service('InventoryService', function(Restangular) {

    this.items = function(params) {
        if(!params)
            params = {};
        return Restangular.all('inventory').getList(params);
    };

    this.item_details = function(id) {
        return Restangular.one('inventory', id).get();
    };

    this.item_options = function(id) {
        return Restangular.one('inventory', id).options();
    };

    this.saveItem = function(data) {
       return Restangular.all('inventory').post(data);
    }; 

    this.updateItem = function(id, data) {
        return Restangular.one('inventory', id).patch(data);
    };

    this.deleteItem = function(id) {
        return Restangular.one('inventory', id).remove();
    };

    this.importItems = function(data) {
        var headers = {
            'Content-Type': undefined
        };
        return Restangular.all('inventory')
            .withHttpConfig({transformRequest: angular.identity})
            .customPOST(data, 'importitems', {}, headers);
    };

    this.completeTransfer = function(itemId, transferId) {
        return Restangular.one('inventory', itemId)
            .customPOST(null, 'transfer', {
                id: transferId,
                complete: 'True'
            }); 
    };

    this.createTransfer = function(itemId, data) {
        return Restangular.one('inventory', itemId)
            .customPOST(data, 'transfer'); 
    };

    this.sets = function(params) {
        if(!params)
            params = {}
        return Restangular.all('inventorysets').getList(params);
    };

    this.getSet = function(id) {
       return Restangular.one('inventorysets', id).get();
    }; 

    this.getSetItems = function(id) {
       return Restangular.one('inventorysets', id).customGETLIST('items');
    }; 

    this.saveSet = function(data) {
       return Restangular.all('inventorysets').post(data);
    }; 

    this.updateSet = function(id, data) {
        return Restangular.one('inventorysets', id).patch(data);
    };

    this.deleteSet = function(id) {
        return Restangular.one('inventorysets', id).remove();
    };

    this.addToSet = function(setId, itemId) {
        return Restangular.one('inventorysets', setId)
            .customPOST({}, 'add', {id: itemId});
    };

    this.removeFromSet = function(setId, itemId) {
        return Restangular.one('inventorysets', setId)
            .customDELETE('remove', {id: itemId});
    };

    this.measures = function(params) {
        if(!params)
            var params = {};
        return Restangular.all('measures').getList(params);
    };

    this.getMeasure = function(measureId) {
        return Restangular.one('measures', measureId).get();
    };

    this.saveMeasure = function(data) {
        return Restangular.all('measures').post(data);
    };

    this.updateMeasure = function(measureId, data) {
        return Restangular.one('measures', measureId).patch(data);
    };

    this.deleteMeasure = function(measureId) {
        return Restangular.one('measures', measureId).remove();
    };

    this.itemTypes = function() {
        return Restangular.all('itemtypes').getList();
    };

    this.getItemType = function(itemtypeId) {
        return Restangular.one('itemtypes', itemtypeId).get();
    };

    this.saveItemType = function(data) {
        return Restangular.all('itemtypes').post(data);
    };

    this.updateItemType = function(itemtypeId, data) {
        return Restangular.one('itemtypes', itemtypeId).patch(data);
    };

    this.deleteItemType = function(itemtypeId) {
        return Restangular.one('itemtypes', itemtypeId).remove();
    };

    this.itemTypes = function(params) {
        if(!params)
            var params = {};
        return Restangular.all('itemtypes').getList(params);
    };

    this.locations = function(params) {
        if(!params)
            var params = {};
        return Restangular.all('locations').getList(params);
    };

    this.getLocation = function(locationId) {
        return Restangular.one('locations', locationId).get();
    };

    this.saveLocation = function(data) {
        return Restangular.all('locations').post(data);
    };

    this.updateLocation = function(locationId, data) {
        return Restangular.one('locations', locationId).patch(data);
    };

    this.deleteLocation = function(locationId) {
        return Restangular.one('locations', locationId).remove();
    };

});

app.service('OrganismService', function(Restangular) {

    this.organisms = function(params) {
        if(!params)
            var params = {};
        return Restangular.all('organisms').getList(params);
    };

    this.getOrganism = function(organismId) {
        return Restangular.one('organisms', organismId).get();
    };

    this.saveOrganism = function(data) {
        return Restangular.all('organisms').post(data);
    };

    this.updateOrganism = function(organismId, data) {
        return Restangular.one('organisms', organismId).patch(data);
    };

    this.deleteOrganism = function(organismId) {
        return Restangular.one('organisms', organismId).remove();
    };

});
