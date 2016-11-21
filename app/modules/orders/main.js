'use strict';

var app = angular.module('limsFrontend');

app.controller('OrdersCtrl', function($scope, PageTitle, OrderService) {

    PageTitle.set('Orders');
    $scope.removePadding = true;

    $scope.selected = [];

    var refreshData = function() {
        OrderService.orders().then(function(data) {
            $scope.orders = data;
        });
    };
    refreshData();

    $scope.$watch('query.search', function(n, o) {
        if (n !== o) {
            refreshData();
        }
    });

    $scope.onSortItems = function(order) {
        refreshData();
    };

    $scope.onPaginateItems = function(page, limit) {
        $scope.query.page = page;
        $scope.query.limit = limit;
        refreshData();
    };

    $scope.deleteItems = function(selected) {
        var d = $mdDialog.confirm()
            .title('Delete ' + selected.length + ' orders?')
            .ok('Delete')
            .cancel('No');
        $mdDialog.show(d).then(function() {
            var promises = [];
            _.each(selected, function(obj) {
                var p = OrderService.deleteOrder(obj.id);
                promises.push(p);
            });
            $q.all(promises).then(function(data) {
                refreshData();
            });
        });
    };

});

app.controller('OrderDetailsCtrl', function($scope, PageTitle,
    OrderService, $stateParams, $state) {

    OrderService.order_details($stateParams.id).then(function(data) {
        $scope.order = data;
        PageTitle.set('Order #' + $scope.order.id + ': ' + $scope.order.name);
    });

    $scope.isList = function(item) {
        if (Array.isArray(item) || typeof item === 'object') {
            return true;
        }
        return false;
    };

    $scope.delete = function() {
        OrderService.remove($stateParams.id).then(function() {
            $state.go('app.orders');
        });
    };

});

app.directive('gtlSubValue', function($sce, $compile) {
    return {
        restrict: 'A',
        scope: {
            data: '=',
        },
        link: function($scope, elem, attr) {
            var output = '';

            var processObject = function(obj) {
                var out = '';
                _.each(obj, function(value, key) {
                    out += '<div layout="row"><b flex="25">'+ key + '</b><span flex class="order-item-value">' + value + '</span></div>';
                });
                return out;
            };

            if (Array.isArray($scope.data)) {
                for (var i = 0; i < $scope.data.length; i++) {
                    output += '<div class="subvalue-group">' + processObject($scope.data[i]) + '</div>';
                }
            } else {
                output += processObject($scope.data);
            }

            var compiled = $compile(output)($scope);
            elem.append(compiled);
        }
    }
});

app.service('OrderService', function(Restangular) {

    this.autocomplete = function(searchText) {
        return Restangular.all('orders').all('autocomplete')
            .getList({q: searchText});
    };

    this.orders = function(params) {
        if (!params) {
            params = {}
        }
        return Restangular.all('orders').getList(params);
    };

    this.order_details = function(identifier) {
        return Restangular.one('orders', identifier).get();
    };

    this.update = function(orderId, data) {
        return Restangular.one('orders', orderId).patch(data);
    };

    this.remove = function(orderId) {
        return Restangular.one('orders', orderId).remove();
    };

    this.statusBarOptions = function() {
        return Restangular.all('orders').all('statuses').getList();
    };

});
