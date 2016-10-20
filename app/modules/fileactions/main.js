'use strict';

var app = angular.module('limsFrontend');

app.service('FileCopyService', function(Restangular) {

    this.copyfiles = function(params) {
        if (!params) {
            params = {};
        }
        return Restangular.all('copyfiles').getList(params);
    };

    this.getCopyFile = function(identifier) {
        return Restangular.one('copyfiles', identifier).get();
    };

    this.saveCopyFile = function(data) {
        return Restangular.all('copyfiles').post(data);
    };

    this.updateCopyFile = function(identifier, data) {
        return Restangular.one('copyfiles', identifier).patch(data);
    };

    this.deleteCopyFile = function(identifier) {
        return Restangular.one('copyfiles', identifier).remove();
    };

});
