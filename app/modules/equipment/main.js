'use strict';

var app = angular.module('limsFrontend');

app.service('EquipmentService', function(Restangular) {

    this.equipment = function(params) {
        if(!params)
            var params = {}
        return Restangular.all('equipment').getList(params);
    };

    this.getEquipment = function(equipmentId) {
        return Restangular.one('equipment', equipmentId).get();
    };

    this.saveEquipment = function(data) {
        return Restangular.all('equipment').post(data);
    };

    this.updateEquipment = function(equipmentId, data) {
        return Restangular.one('equipment', equipmentId).patch(data);
    };

    this.deleteEquipment = function(equipmentId) {
        return Restangular.one('equipment', equipmentId).remove();
    };

});
