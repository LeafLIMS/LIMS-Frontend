'use strict';

var app = angular.module('limsFrontend');

app.controller('LoginModalCtrl', function($scope, UserService, $mdDialog) {
    $scope.cancel = $mdDialog.hide;

    $scope.submit = function(username, password) {
        UserService.login(username, password).then(function(data) {
            var user = {};
            user.id = data.id;
            user.token = data.token;
            user.username = username;
            user.status = data.status;
            UserService.setUser(user)
            $mdDialog.hide(user);
        }).catch(function(error) {
            $scope.messages = error.data.message;
        });
    };
});

app.service('loginModal', function(UserService, $mdDialog) {

    return function() {
        $mdDialog.cancel();
        var instance = $mdDialog.show({
            templateUrl: 'modules/auth/views/loginmodal.html',
            controller: 'LoginModalCtrl',
        });
        return instance;
        /*
            .then(function(data) {
            console.log(data);
            console.log('set user data');
            UserService.setUser(data)
        }).catch(function(err) {
            console.log('caught');
        });
        */
    }

});

app.service('UserService', function(Restangular, $localStorage) {

    this.autocomplete = function(searchText) {
        return Restangular.all('users').all('autocomplete')
            .getList({q: searchText});
    }

    this.isLoggedIn = function() {
        if (typeof $localStorage.user !== 'undefined') {
            return true;
        }
        return false;
    };

    this.users = function(params) {
        if (!params) {
            params = {}
        }
        return Restangular.all('users').getList(params);
    };

    this.getUserDetails = function(userId) {
        return Restangular.one('users', userId).get();
    };

    this.saveUser = function(data) {
        return Restangular.all('users').post(data);
    };

    this.updateUserDetails = function(userId, data) {
        return Restangular.one('users', userId).patch(data);
    };

    this.deleteUser = function(userId) {
        return Restangular.one('users', userId).remove();
    };

    this.setUser = function(user) {
        $localStorage.user = user;
        return $localStorage.user;
    };

    this.getUser = function() {
        return $localStorage.user;
    };

    this.listStaff = function() {
        return Restangular.one('users').all('staff').getList();
    };

    this.login = function(username, password) {
        var params = {username: username, password: password}
        return Restangular.one('users').customPOST(params, 'token');
    };

    this.logout = function() {
        delete $localStorage.user;
    };

});

app.service('GroupService', function(Restangular) {

    this.groups = function(params) {
        if (!params) {
            params = {}
        }
        return Restangular.all('groups').getList(params);
    };

    this.getGroup = function(groupId) {
        return Restangular.one('groups', groupId).get();
    };

    this.saveGroup = function(data) {
        return Restangular.all('groups').post(data);
    };

    this.updateGroup = function(groupId, data) {
        return Restangular.one('groups', groupId).patch(data);
    };

    this.deleteGroup = function(groupId) {
        return Restangular.one('groups', groupId).remove();
    };

    this.permissions = function(params) {
        if (!params) {
            params = {}
        }
        return Restangular.all('permissions').getList(params);
    };

});
