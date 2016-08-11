'use strict';

/**
 * @ngdoc overview
 * @name limsFrontendApp
 * @description
 * # limsFrontendApp
 *
 * Main module of the application.
 */
var app = angular
  .module('limsFrontend', [
    'ngAnimate',
    'ngMaterial',
    'ngMessages',
    'angular-loading-bar',
    'md.data.table',
    'ui.router',
    'ngStorage',
    'restangular',
    'satellizer',
    'ui.tinymce',
    'ngFileUpload',
    'ui.sortable',
    'sf.treeRepeat',
    'drop-ng',
    'datetime',
    'config',
  ]);

app.config(function($stateProvider, $urlRouterProvider, $mdThemingProvider,
    RestangularProvider, $authProvider, $httpProvider, $mdIconProvider,
    API_URL) {

    $httpProvider.interceptors.push(function($timeout, $q, $injector) {
        var loginModal, $http, $state;

        $timeout(function() {
            loginModal = $injector.get('loginModal');
            $http = $injector.get('$http');
            $state = $injector.get('$state');
        });

        return {
            responseError: function(rejection) {
                if (rejection.status !== 401) {
                    return $q.reject(rejection);
                }

                var deferred = $q.defer();

                loginModal().then(function(responseData) {
                    deferred.resolve($http(rejection.config));
                }).catch(function() {
                    $state.go('welcome');
                    deferred.reject(rejection);
                });

                return deferred.promise;
            },
        };
    });

    RestangularProvider.setBaseUrl(API_URL);
    RestangularProvider.setRequestSuffix('/');

    RestangularProvider.addResponseInterceptor(function(data, operation,
        what, url, response, deferred) {
        var extractedData;
        if (operation == 'getList' && data.meta) {
            extractedData = data.results;
            extractedData.meta = data.meta;
        } else {
            extractedData = data;
        }
        return extractedData;
    });

    $urlRouterProvider.otherwise('welcome');

    $stateProvider
        .state('error', {
            url: '/error',
            template: 'An wild error has appeared.',
            data: {
                requireLogin: false,
            },
        })
        .state('welcome', {
            url: '/welcome',
            templateUrl: 'modules/shared/views/welcome.html',
            controller: 'WelcomeCtrl',
            data: {
                requireLogin: false,
            },
        })
        .state('app', {
            abstract: true,
            url: '',
            templateUrl: 'modules/shared/views/layout.html',
            controller: 'AppCtrl',
            data: {
                requireLogin: true,
            },
        })
        .state('app.dashboard', {
            url: '/dashboard',
            views: {
                content: {
                    templateUrl: 'modules/dashboard/views/dashboard.html',
                    controller: 'DashboardCtrl',
                },
            },
        })
        // Orders states
        .state('app.orders', {
            url: '/orders',
            views: {
                content: {
                    templateUrl: 'modules/orders/views/orders.html',
                    controller: 'OrdersCtrl',
                },
            },
        })
        .state('order_details', {
            parent: 'app.orders',
            url: '/:id',
            views: {
                'content@app': {
                    templateUrl: 'modules/orders/views/order_details.html',
                    controller: 'OrderDetailsCtrl',
                },
            },
        })
        // Projects states
        .state('app.projects', {
            url: '/projects',
            views: {
                content: {
                    templateUrl: 'modules/projects/views/projects.html',
                    controller: 'ProjectsCtrl',
                },
            },
        })
        .state('project_details', {
            parent: 'app.projects',
            url: '/:id',
            views: {
                'content@app': {
                    templateUrl: 'modules/projects/views/project_details.html',
                    controller: 'ProjectDetailsCtrl',
                },
            },
        })
        .state('product_details', {
            parent: 'project_details',
            url: '/product/:productId',
            views: {
                product: {
                    templateUrl: 'modules/projects/views/product_details.html',
                    controller: 'ProductDetailsCtrl',
                },
            },
        })
        // Workflow states
        .state('app.workflows', {
            url: '/workflows',
            views: {
                content: {
                    templateUrl: 'modules/workflows/views/workflows.html',
                    controller: 'WorkflowsCtrl',
                },
            },
        })
        .state('app.workflows.workflow', {
            url: '/:id',
            views: {
                workflow: {
                    templateUrl: 'modules/workflows/views/workflow_partial.html',
                    controller: 'WorkflowSelectedCtrl',
                },
            },
        })
        // Inventory states
        .state('app.inventory', {
            url: '/inventory',
            views: {
                content: {
                    templateUrl: 'modules/inventory/views/inventory.html',
                    controller: 'InventoryCtrl',
                },
            },
        })
        .state('inventory_item', {
            parent: 'app.inventory',
            url: '/:id',
            views: {
                'content@app': {
                    templateUrl: 'modules/inventory/views/inventory_item.html',
                    controller: 'InventoryItemCtrl',
                },
            },
        })
        .state('app.inventory.set', {
            url: '/set/:id',
            views: {
                'content@app': {
                    templateUrl: 'modules/inventory/views/set.html',
                    controller: 'SetCtrl',
                },
            },
        })
        // Configuration states
        .state('app.configuration', {
            url: '/configuration',
            views: {
                content: {
                    templateUrl: 'modules/configuration/views/configuration.html',
                    controller: 'ConfigurationCtrl',
                },
            },
        })
        .state('app.configuration.section', {
            url: '/:sectionName',
            views: {
                'configuration-section': {
                    templateUrl: function($stateParams) {
                        return 'modules/configuration/views/' +
                            $stateParams.sectionName.toLowerCase() + '.html';
                    },
                    controllerProvider: function($stateParams) {
                        return $stateParams.sectionName + 'ConfigurationCtrl';
                    },
                },
            },
        })
        // Equipment
        .state('app.equipment', {
            url: '/equipment',
            views: {
                content: {
                    templateUrl: 'modules/equipment/views/equipment.html',
                    controller: 'EquipmentCtrl',
                },
            },
        })

    $mdIconProvider
        .iconSet('alt', 'images/mdi.svg');

    $mdThemingProvider.theme('default')
        .primaryPalette('light-green')
        .accentPalette('amber');

});

app.run(function($rootScope, Restangular, UserService, loginModal, $state) {

    Restangular.addFullRequestInterceptor(function(el, op, what, url,
        headers) {
        if (UserService.isLoggedIn()) {
            headers.Authorization = 'Token ' + UserService.getUser().token;
        }
        return {
            headers: headers,
        }
    });

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams) {
        var requireLogin = toState.data.requireLogin;

        if (requireLogin && !UserService.isLoggedIn()) {
            event.preventDefault();

            loginModal().then(function() {
                return $state.go(toState.name, toParams);
            }).catch(function() {
                return $state.go('welcome');
            });
        }
    });

});
