'use strict';

var app = angular.module('limsFrontend');

app.controller('ProjectsCtrl', function($scope, PageTitle, ProjectService,
    $mdDialog, CRMService, $q, UserService) {

    PageTitle.set('Projects');
    $scope.removePadding = true;

    $scope.crmEnabled = UserService.getUser().crmEnabled;

    $scope.query = {
        ordering: 'identifier',
        limit: 10,
        archive: 'False',
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

    $scope.hasFilter = function(fieldName, scopeQueryName) {
        if (!scopeQueryName) {
            scopeQueryName = 'query';
        }
        if (fieldName in $scope[scopeQueryName]) {
            return true;
        }
        return false;
    };

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
            controller: function($scope, $mdDialog, $mdToast, OrderService,
                UserService, CRMService, ErrorService, $state, crmEnabled) {

                $scope.crmEnabled = crmEnabled;

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
                        }).catch(function(err) {
                            $mdDialog.hide();
                            $state.go('project_details', {id: data.id});
                            $mdToast.show(
                                $mdToast.simple()
                                .textContent(ErrorService.parseError(err))
                                .position('top right')
                                .hideDelay(6000));
                        });
                    });
                };

                $scope.cancel = function() {
                    $mdDialog.cancel();
                };

            },
            locals: {
                crmEnabled: $scope.crmEnabled,
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
                var p = ProjectService.deleteProject(obj.id);
                promises.push(p);
            });
            $q.all(promises).then(function(data) {
                refreshData();
            });
        });
    };

    $scope.updateCRM = function(selected) {
        var selectedIDs = _.pull(_.map(selected, function(obj) {
            if (obj.crm_project) {
                return obj.crm_project.id;
            }
        }), undefined);
        CRMService.updateProjects(selectedIDs).then(function(data) {
            refreshData();
        });
    };

});

app.controller('ProjectDetailsCtrl', function($scope, PageTitle,
    ProjectService, WorkflowService, $stateParams, $mdDialog, $rootScope,
    $q, UserService, OrganismService, $state) {

    $scope.removePadding = true;

    $scope.crmEnabled = UserService.getUser().crmEnabled;

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

    $scope.query = {
        ordering: 'product_identifier',
        limit: 10,
        project: $stateParams.id,
    };

    $scope.returnProductData = function() {
        if ($scope.productFilter) {
            $scope.query.search = $scope.productFilter;
        }
        return ProjectService.products($scope.query);
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
        });
    };

    // Get initial product data on page load.
    // Will only be called if the page is refreshed.
    $scope.returnProductData().then(function(data) {
        $scope.products = data;
        $scope.initialProductCount = data.length;
    });

    $scope.$watch('query.search', function(n, o) {
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

    var updateProjectData = function() {
        ProjectService.updateProject($scope.project.id, $scope.project)
            .then(function(data) {
                getProjectData();
            });
    };

    $scope.onSortItems = function(order) {
        $scope.getProductData();
    };

    $scope.onPaginateItems = function(page, limit) {
        $scope.query.page = page;
        $scope.query.limit = limit;
        $scope.getProductData();
    };

    var updateDelayed = function() {
        $scope.$apply(function() { updateProjectData() });
    };

    var updateThrottled = _.debounce(updateDelayed, 1000);

    $scope.$watch('project', function(n, o) {
        if (n && o && n !== o && o.id) {
            updateThrottled();
        }
    }, true);

    $scope.linkCRM = function() {
        $mdDialog.show({
            templateUrl: 'modules/projects/views/linkcrm.html',
            controller: function($scope, $mdDialog, CRMService, ErrorService, projectId) {

                $scope.cancel = $mdDialog.cancel;

                $scope.filterCRMProjects = function(searchText) {
                    return CRMService.projects({search: searchText});
                };

                $scope.setCRMProject = function(item) {
                    $scope.crm_project = item.Id;
                };

                $scope.add = function() {
                    CRMService.linkProject(projectId, $scope.crm_project)
                        .then(function() {
                            $mdDialog.hide();
                        }).catch(function(err) {
                            $scope.message = ErrorService.parseError(err);
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

    $scope.addExternalLink = function() {
        $mdDialog.show({
            templateUrl: 'modules/projects/views/addlink.html',
            controller: function($scope, $mdDialog, project) {

                $scope.cancel = $mdDialog.cancel;

                $scope.add = function() {
                    if (!project.links) {
                        project.links = [];
                    }
                    project.links.push($scope.link);
                    $mdDialog.hide();
                };
            },
            locals: {
                project: $scope.project,
            },
        });
    };

    $scope.removeExternalLink = function(index) {
        $scope.project.links.splice(index, 1);
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

    $scope.importProducts = function(projectId) {
        $mdDialog.show({
            templateUrl: 'modules/projects/views/importproducts.html',
            controller: 'ImportProductsCtrl',
            locals: {
                projectId: projectId,
                designTypes: $scope.designTypes,
            },
        });
    };

    $scope.deleteItems = function(selected) {
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

    $scope.setArchiveStatus = function() {
        if ($scope.project.archive) {
            $scope.project.archive = false;
        } else {
            $scope.project.archive = true;
        }
    };

    $rootScope.$on('project-product-added', $scope.getProductData);
    $rootScope.$on('project-product-updated', $scope.getProductData);
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
    ProjectService, InventoryService, $mdDialog, $timeout, $rootScope) {

    var getProduct = function() {
        ProjectService.getProduct($stateParams.productId).then(function(data) {
            $scope.product = data;
            $scope.pText = data.product_type;
        });
    };
    getProduct();

    InventoryService.itemTypes({limit: 200}).then(function(data) {
        $scope.productTypes = data;
    });

    $scope.filterProductType = function(filterText) {
        return InventoryService.itemTypes({search: filterText});
    };

    $scope.setProductType = function(item) {
        $scope.product.product_type = item.name;
    };

    var timeout = null;
    var doUpdate = function() {
        if ($scope.productForm.$valid) {
            ProjectService.updateProduct($scope.product.id, $scope.product).then(function(data) {
                $rootScope.$broadcast('project-product-updated');
            });
        } else {
            console.log('INVALID');
        }
    };

    var debounceUpdate = function(n, o) {
        if (n !== o && o !== undefined && 'id' in o) {
            if (timeout) {
                $timeout.cancel(timeout);
            }
            timeout = $timeout(doUpdate, 1000);
        }
    };

    $scope.$watch('product', debounceUpdate, true);

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

    $scope.addAttachment = function() {
        $mdDialog.show({
            templateUrl: 'modules/projects/views/addattachment.html',
            controller: function($scope, $mdDialog, ProjectService,
                InventoryService, product) {

                $scope.cancel = $mdDialog.cancel;

                $scope.add = function() {
                    var params = new FormData();
                    params.append('attachment', $scope.attachment);
                    ProjectService.addAttachment(product.id, params).then(function() {
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

    $scope.removeAttachment = function(attachmentId) {
        $mdDialog.show(
            $mdDialog.confirm()
            .title('Remove this attachment?')
            .ok('Yes')
            .cancel('No')
        ).then(function() {
            ProjectService.deleteAttachment($stateParams.productId, attachmentId).then(
                   function(data) {
                       getProduct();
                   });
        });
    };

    $scope.replaceDesign = function(file) {
        if (file) {
            var reader = new FileReader();
            reader.onload = function(event) {
                var designData = {
                    design_file: event.target.result,
                };
                ProjectService.replaceDesign($stateParams.productId, designData).then(
                       function(data) {
                           getProduct();
                       });
            }
            reader.readAsText(file);
        }
    };

    $scope.refreshDesign = function() {
        ProjectService.refreshDesign($stateParams.productId).then(function(data) {
            getProduct();
        });
    };

    $scope.getHistory = function(productId) {
        $mdDialog.show({
            templateUrl: 'modules/projects/views/product_history.html',
            controller: function($scope, $mdDialog, ProjectService, product) {
                $scope.cancel = $mdDialog.cancel;
                $scope.product = product;
            },
            locals: {
                product: $scope.product,
            },
        });

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

    InventoryService.itemTypes({limit: 200}).then(function(data) {
        $scope.productTypes = data;
    });

    ProjectService.productStatuses().then(function(data) {
        $scope.productstatuses = data;
    });

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


app.controller('ImportProductsCtrl', function($scope, $mdDialog, ProjectService, $rootScope,
    projectId, designTypes) {

    $scope.cancel = $mdDialog.cancel;

    $scope.create = function() {
        var params = new FormData();
        params.append('products_file', $scope.products_file);
        if ($scope.designs_file) {
            params.append('designs_file', $scope.designs_file);
        }
        ProjectService.importProducts(projectId, params).then(function() {
            $rootScope.$broadcast('project-product-added');
            $mdDialog.hide();
        });
    };

});

app.service('ProjectService', function(Restangular) {

    this.projects = function(params) {
        if (!params) {
            params = {};
        }
        return Restangular.all('projects').getList(params);
    };

    this.projectStats = function(field, params) {
        if (!params) {
            params = {
                field: field,
            }
        } else {
            params.field = field;
        }
        return Restangular.all('projects').customGET('stats', params);
    };

    this.project_details = function(identifier) {
        return Restangular.one('projects', identifier).get();
    };

    this.createProject = function(data) {
        return Restangular.all('projects').post(data);
    };

    this.updateProject = function(projectId, data) {
        return Restangular.one('projects', projectId).patch(data);
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

    this.productStats = function(field, params) {
        if (!params) {
            params = {
                field: field,
            }
        } else {
            params.field = field;
        }
        return Restangular.all('products').customGET('stats', params);
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

    this.importProducts = function(projectId, productFiles) {
        return Restangular.one('projects', projectId)
               .withHttpConfig({transformRequest: angular.identity})
               .customPOST(productFiles, 'import_products', undefined, {
                    'Content-Type': undefined,
                });
    };

    this.updateProduct = function(productId, productData) {
        // Remove linked_inventory if its a dict
        productData = _.clone(productData);
        if (typeof productData.linked_inventory[0] == 'object') {
            delete productData.linked_inventory;
        }
        delete productData.data;
        return Restangular.one('products', productId).patch(productData);
    };

    this.deleteProduct = function(productId) {
        return Restangular.one('products', productId).remove();
    };

    this.replaceDesign = function(productId, data) {
        return Restangular.one('products', productId).customPOST(data, 'replace_design');
    };

    this.refreshDesign = function(productId) {
        return Restangular.one('products', productId).customPOST(null, 'refresh_design');
    };

    this.addAttachment = function(productId, data) {
        return Restangular.one('products', productId)
               .withHttpConfig({transformRequest: angular.identity})
               .customPOST(data, 'add_attachment', undefined, {
                    'Content-Type': undefined,
                });
    };

    this.deleteAttachment = function(productId, attachmentId) {
        return Restangular.one('products', productId)
               .customDELETE('delete_attachment', {id: attachmentId});
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

    this.updateProjects = function(selectedIDs) {
        var data = {crm_ids: selectedIDs};
        return Restangular.all('crm').customPOST(data, 'project/update');
    };

    this.linkProject = function(projectId, crmProjectId) {
        var data = {identifier: crmProjectId, id: projectId};
        return Restangular.all('crm').customPOST(data, 'link');
    };

    this.updateAccounts = function(selectedIDs) {
        var data = {crm_ids: selectedIDs};
        return Restangular.all('crm').customPOST(data, 'account/update');
    };

    this.addAccount = function(emailAddress) {
        var data = {email: emailAddress, add_only: 'True'};
        return Restangular.all('crm').customPOST(data, 'user');
    };

    this.removeAccount = function(emailAddress) {
        return Restangular.all('crm').customDELETE('user', {email: emailAddress});
    };

});
