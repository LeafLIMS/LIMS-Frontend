'use strict';

var app = angular.module('limsFrontend');

app.service('FileTemplateService', function(Restangular) {

    this.templates = function(params) {
        if (!params) {
            params = {};
        }
        return Restangular.all('filetemplates').getList(params);
    };

    this.getTemplate = function(filetemplatesId) {
        return Restangular.one('filetemplates', filetemplatesId).get();
    };

    this.saveTemplate = function(data) {
        return Restangular.all('filetemplates').post(data);
    };

    this.updateTemplate = function(filetemplatesId, data) {
        return Restangular.one('filetemplates', filetemplatesId).patch(data);
    };

    this.deleteTemplate = function(filetemplatesId) {
        return Restangular.one('filetemplates', filetemplatesId).remove();
    };

});
