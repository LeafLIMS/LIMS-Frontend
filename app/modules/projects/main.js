'use strict';

var app = angular.module('limsFrontend');

app.controller('ProjectsCtrl', function($scope, PageTitle, ProjectService,
    $mdDialog) {

    PageTitle.set('Projects');
    $scope.removePadding = true;

    $scope.query = {
        ordering: 'identifier',
        limit: 10,
    };

    $scope.selected = [];

    var refreshData = function() {
        ProjectService.projects($scope.query).then(function(data) {
            $scope.projects = data;
        });
    }
    refreshData();

    $scope.$watch('query.search', function(n, o) {
        if (n !== o) {
            refreshData();
        }
    });

    $scope.toggleFilter = function(fieldName, value) {
        // If value == undefined then boolean toggle
        if (fieldName in $scope.query) {
            delete $scope.query[fieldName]
        } else {
            if (!value) {
                value = 'True';
            }
            $scope.query[fieldName] = value;
        }
        refreshData();
    };

    $scope.onSortItems = function(order) {
        refreshData();
    };

    $scope.onPaginateItems = function(page, limit) {
        $scope.query.page = page;
        $scope.query.limit = limit;
        refreshData();
    };

    $scope.createProject = function() {
        $mdDialog.show({
            templateUrl: 'modules/projects/views/createproject.html',
            controller: function($scope, $mdDialog, OrderService,
                UserService, CRMService, $state) {

                $scope.project = {};

                $scope.filterCRMProjects = function(searchText) {
                    return CRMService.projects({search: searchText});
                };

                $scope.fillDetails = function(item) {
                    $scope.project.name = item.Name;
                    $scope.project.description = item.Description;
                    $scope.project_identifier = item.Id;
                };

                $scope.filterOrders = function(searchText) {
                    return OrderService.autocomplete(searchText);
                };

                $scope.orderChanged = function(itemSelected) {
                    if (itemSelected.data.products.length > 0) {
                        $scope.product_count = itemSelected.data.products.length;
                    }
                };

                UserService.listStaff().then(function(data) {
                    $scope.staff = data;
                });

                $scope.create = function() {
                    if ($scope.orderSelected) {
                        $scope.project.order = $scope.orderSelected.id;
                    }
                    ProjectService.createProject($scope.project).then(function(data) {


                        CRMService.linkProject(data.id,
                            $scope.project_identifier).then(function(crmData) {
                            if ($scope.orderSelected) {
                                var products = $scope.orderSelected.data.products;
                                for (var i = 0; i < products.length; i++) {
                                    products[i].project = data.id;
                                    ProjectService.addProduct(products[i]);
                                }
                            }
                            $state.go('project_details', {id: data.id});
                            $mdDialog.hide();
                        });

                    });
                };

                $scope.cancel = function() {
                    $mdDialog.cancel();
                };

            },
        });
    };

    $scope.deleteItems = function(selected) {
        var d = $mdDialog.confirm()
            .title('Delete ' + selected.length + ' projects?')
            .ok('Delete')
            .cancel('No');
        $mdDialog.show(d).then(function() {
            var promises = [];
            _.each(selected, function(obj) {
                var p = ProjectService.deleteItem(obj.id);
                promises.push(p);
            });
            $q.all(promises).then(function(data) {
                $scope.refreshItemData();
            });
        });
    };

});

app.controller('ProjectDetailsCtrl', function($scope, PageTitle,
    ProjectService, WorkflowService, $stateParams, $mdDialog, $rootScope,
    $q, UserService, OrganismService, $state) {

    $scope.removePadding = true;

    var getProjectData = function() {
        ProjectService.project_details($stateParams.id).then(function(data) {
            $scope.project = data;
            PageTitle.set('Project ' +
                $scope.project.project_identifier + ': ' + $scope.project.name);
        });
    };
    getProjectData();

    UserService.listStaff().then(function(data) {
        $scope.staff = data;
    });

    OrganismService.organisms().then(function(data) {
        $scope.organisms = data;
    });

    ProjectService.productStatuses().then(function(data) {
        $scope.productstatuses = data;
    });

    $scope.selected = [];

    $scope.productFilter = '';
    $scope.currentProductId = undefined;

    $scope.initialProductCount = 0;

    $scope.returnProductData = function() {
        var params = {
            project: $stateParams.id,
            limit: 200,
            ordering: '-id',
        }
        if ($scope.productFilter) {
            params.search = $scope.productFilter;
        }
        return ProjectService.products(params);
    };

    $scope.getProductData = function(event) {
        $scope.returnProductData().then(function(data) {
            $scope.products = data;
            if (event) {
                $scope.initialProductCount = data.length;
            }
        });
    };

    $scope.getProductDataAfterDelete = function(event) {
        $scope.returnProductData().then(function(data) {
            $scope.products = data;
            if (event) {
                $scope.initialProductCount = data.length;
            }
            $scope.currentProductId = data[0].id;
            $scope.selectedProduct = data[0];
            $state.go('product_details',
                    {productId: data[0].id},
                    {location: 'replace'}
                    );
        });
    };

    $scope.$on('$stateChangeSuccess', function(e, toState, toParams) {
        if (toState.name == 'product_details') {
            $scope.currentProductId = toParams.productId;
        }
    });

    // Get initial product data on page load.
    // Will only be called if the page is refreshed.
    $scope.returnProductData().then(function(data) {
        $scope.products = data;
        $scope.initialProductCount = data.length;
        if (data.length > 0) {
            if ($state.params.productId) {
                $scope.currentProductId = $state.params.productId;
                $scope.selectedProduct = _.find($scope.products, function(obj) {
                    return obj.id == $scope.currentProductId;
                });
            } else {
                $scope.currentProductId = data[0].id;
                $scope.selectedProduct = data[0];
                $state.go('product_details',
                        {productId: data[0].id},
                        {location: 'replace'}
                        );
            }
        }
    });

    $scope.getSelectedProductText = function(selectedProduct) {
        if (selectedProduct) {
            var name = selectedProduct.product_identifier + ': ' + selectedProduct.name;
            var count = ' (' +
                        $scope.initialProductCount +
                        ' products)';
            return name + count;
        }
        return '';
    };

    $scope.$watch('productFilter', function(n, o) {
        $scope.returnProductData().then(function(data) {
            $scope.products = data;
        });
    });

    $scope.changeProduct = function(selectedProduct) {
        $scope.selectedProduct = selectedProduct;
        if (selectedProduct) {
            $state.go('product_details', {productId: selectedProduct.id});
        }
    };

    $scope.linkCRM = function() {
        $mdDialog.show({
            templateUrl: 'modules/projects/views/linkcrm.html',
            controller: function($scope, $mdDialog, CRMService, projectId) {

                $scope.cancel = $mdDialog.cancel;

                $scope.filterCRMProjects = function(searchText) {
                    return CRMService.projects({search: searchText});
                };

                $scope.setCRMProject = function(item) {
                    $scope.crm_project = item.Id;
                    console.log($scope.crm_project, item);
                };

                $scope.add = function() {
                    CRMService.linkProject(projectId, $scope.crm_project)
                        .then(function() {
                            $mdDialog.hide();
                        });
                };
            },
            locals: {
                projectId: $scope.project.id,
            },
        }).then(function() {
            getProjectData();
        });
    };

    $scope.createProduct = function(projectId) {
        $mdDialog.show({
            templateUrl: 'modules/projects/views/createproduct.html',
            controller: 'CreateProductCtrl',
            locals: {
                projectId: projectId,
                designTypes: $scope.designTypes,
            },
        });

    };

    $scope.deleteProduct = function() {
        var sl = $scope.selected.length;
        var confirmDelete = $mdDialog.confirm()
            .title('Are you sure you want to delete these ' + sl + ' products?')
            .ariaLabel('Confirm delete product')
            .ok('Yes')
            .cancel('No');
        $mdDialog.show(confirmDelete).then(function() {
            _.each($scope.selected, function(obj) {
                ProjectService.deleteProduct(obj.id)
                    .then(function() {
                        $rootScope.$broadcast('project-product-deleted');
                    });
            });
        });
    };

    $scope.deleteProject = function() {
        var confirmDelete = $mdDialog.confirm()
            .title('Are you sure you want to delete this project?')
            .ariaLabel('Confirm delete project')
            .ok('Yes')
            .cancel('No');
        $mdDialog.show(confirmDelete).then(function() {
            ProjectService.deleteProject($scope.project.id)
                .then(function() {
                    $rootScope.$broadcast('project-deleted');
                    $state.go('app.projects');
                });
        });
    };

    $rootScope.$on('project-product-added', $scope.getProductData);
    $rootScope.$on('project-product-deleted', $scope.getProductDataAfterDelete);

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

app.controller('ProductDetailsCtrl', function($scope, $stateParams,
    ProjectService, InventoryService, $mdDialog) {

    var getProduct = function() {
        ProjectService.getProduct($stateParams.productId).then(function(data) {
            $scope.product = data;
            $scope.pText = data.product_type;
            $scope.getDesigns();
        });
    };
    getProduct();

    $scope.filterProductType = function(filterText) {
        return InventoryService.itemTypes({search: filterText});
    };

    $scope.setProductType = function(item) {
        $scope.product.product_type = item.name;
    };

    $scope.updateProduct = function() {
    };

    $scope.addInventoryItem = function() {
        $mdDialog.show({
            templateUrl: 'modules/projects/views/addinventoryitem.html',
            controller: function($scope, $mdDialog, ProjectService,
                InventoryService, product) {

                $scope.cancel = $mdDialog.cancel;

                $scope.filterItems = function(searchText) {
                    return InventoryService.items({search: searchText});
                };

                $scope.setItem = function(item) {
                    $scope.itemId = item.id;
                };

                $scope.add = function() {
                    var linkedItems = _.map(product.linked_inventory,
                        function(obj) {
                            return obj.id;
                        });
                    linkedItems.push($scope.itemId);
                    var data = {
                        linked_inventory: linkedItems,
                    };
                    ProjectService.updateProduct($stateParams.productId, data).then(
                           function(data) {
                               $mdDialog.hide();
                           });
                };
            },
            locals: {
                product: $scope.product,
            },
        }).then(function() {
            getProduct();
        });
    };

    $scope.removeInventoryItem = function(index) {
        $mdDialog.show(
            $mdDialog.confirm()
            .title('Remove this item linkage?')
            .ok('Yes')
            .cancel('No')
        ).then(function() {
            $scope.product.linked_inventory.splice(index, 1);
            var linkedItems = _.map($scope.product.linked_inventory,
                function(obj) {
                    return obj.id;
                });
            var data = {
                linked_inventory: linkedItems,
            };
            ProjectService.updateProduct($stateParams.productId, data).then(
                   function(data) {
                       getProduct();
                   });
        });
    };

    $scope.designs = [];
    $scope.getDesigns = function() {
    };
});


app.controller('ProductHistoryCtrl', function($scope, $stateParams,
    ProjectService, InventoryService, $mdDialog) {

    var getProduct = function() {
        ProjectService.getProduct($stateParams.productId).then(function(data) {
            $scope.product = data;
        });
    };
    getProduct();

});


app.controller('CreateProductCtrl', function($scope, $mdDialog, ProjectService,
    OrganismService, UserService, InventoryService, $rootScope,
    projectId, designTypes) {

    OrganismService.organisms().then(function(data) {
        $scope.organisms = data;
    });

    InventoryService.itemTypes().then(function(data) {
        $scope.product_types = data;
    });

    ProjectService.productStatuses().then(function(data) {
        $scope.productstatuses = data;
    });

    $scope.filterProductType = function(filterText) {
        return InventoryService.itemTypes({search: filterText});
    };

    $scope.setProductType = function(item) {
        $scope.product.product_type = item.name;
    };

    $scope.cancel = function() {
        $mdDialog.cancel();
    };

    var createNewProduct = function() {
        ProjectService.addProduct($scope.product).then(function(data) {
            $rootScope.$broadcast('project-product-added');
            $mdDialog.hide();
        });
    };

    $scope.create = function() {
        $scope.product.project = projectId;
        if ($scope.design_file) {
            var reader = new FileReader();
            reader.onload = function(event) {
                $scope.product.design = event.target.result;
                createNewProduct();
            }
            reader.readAsText($scope.design_file);
        } else {
            createNewProduct();
        }
    };

});

app.service('ProjectService', function(Restangular) {

    this.projects = function(params) {
        if (!params) {
            params = {};
        }
        return Restangular.all('projects').getList(params);
    };

    this.project_details = function(identifier) {
        return Restangular.one('projects', identifier).get();
    };

    this.createProject = function(data) {
        return Restangular.all('projects').post(data);
    };

    this.deleteProject = function(identifier) {
        return Restangular.one('projects', identifier).remove();
    };

    this.products = function(params) {
        if (!params) {
            params = {};
        }
        return Restangular.all('products').getList(params);
    };

    this.getProduct = function(productId, params) {
        if (!params) {
            params = {};
        }
        return Restangular.one('products', productId).get(params);
    };

    this.addProduct = function(productData) {
        return Restangular.all('products').post(productData);
    };

    this.updateProduct = function(productId, productData) {
        return Restangular.one('products', productId).patch(productData);
    };

    this.deleteProduct = function(productId) {
        return Restangular.one('products', productId).remove();
    };

    this.productStatuses = function(params) {
        if (!params) {
            params = {};
        }
        return Restangular.all('productstatuses').getList(params);
    };

    this.getProductStatus = function(productstatusId) {
        return Restangular.one('productstatuses', productstatusId).get();
    };

    this.saveProductStatuses = function(productstatusData) {
        return Restangular.all('productstatuses').post(productstatusData);
    };

    this.updateProductStatuses = function(productstatusId, productstatusData) {
        return Restangular.one('productstatuses', productstatusId).patch(productstatusData);
    };

    this.deleteProductStatuses = function(productstatusId) {
        return Restangular.one('productstatuses', productstatusId).remove();
    };

});

app.service('CRMService', function(Restangular) {

    this.projects = function(params) {
        if (!params) {
            params = {};
        }
        return Restangular.all('crm').customGETLIST('project', params);
    };

    this.linkProject = function(projectId, crmProjectId) {
        var data = {identifier: crmProjectId, id: projectId};
        return Restangular.all('crm').customPOST(data, 'link');
    };

});
