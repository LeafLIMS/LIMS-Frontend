'use strict';

var app = angular.module('limsFrontend');

app.controller('OrdersCtrl', function($scope, PageTitle, OrderService) {

    PageTitle.set('Orders');
    $scope.removePadding = true;

    $scope.orders = OrderService.orders();
    OrderService.orders().then(function(data) {
        $scope.orders = data;
    });

});

app.controller('OrderDetailsCtrl', function($scope, PageTitle, 
    OrderService, $stateParams, $state) {

    $scope.removePadding = true;
    OrderService.order_details($stateParams.id).then(function(data) {
        $scope.order = data;
        PageTitle.set('Order #' +$scope.order.id + ': ' + $scope.order.name);

        var services = {};                                                
        _.each($scope.order.data.samples, function(obj) {                    
            services[obj.name] = obj.services;                            
        });                                                               
        $scope.total = _.reduce(services, function(total, n) {            
            return total + _.reduce(n, function(subtotal, m) {            
                return subtotal + m.cost;                                 
            }, 0);                                                        
        }, 0);

    });

    OrderService.statusBarOptions().then(function(data) {                 
        $scope.order_bar_statuses = data;                                 
    });

    $scope.delete = function() {
        OrderService.remove($stateParams.id).then(function() {
            $state.go('app.orders');
        });
    };

});

app.service('OrderService', function(Restangular) {

    this.autocomplete = function(searchText) {
        return Restangular.all('orders').all('autocomplete')
            .getList({q: searchText});
    };

    this.orders = function(params) {
        if(!params)
            params = {}
        return Restangular.all('orders').getList(params);
    };

    this.order_details = function(identifier) {
        return Restangular.one('orders', identifier).get();
    };

    this.update = function(order_id, data) {                              
        return Restangular.one('orders', order_id).patch(data);           
    };                                                                    
                                                                          
    this.remove = function(order_id) {                                    
        return Restangular.one('orders', order_id).remove();              
    };                                                                    
                                                                          
    this.statusBarOptions = function() {                                  
        return Restangular.all('orders').all('statuses').getList();       
    };

});
