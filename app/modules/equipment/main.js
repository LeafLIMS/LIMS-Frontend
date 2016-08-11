'use strict';

var app = angular.module('limsFrontend');

app.controller('EquipmentCtrl', function($scope, PageTitle, EquipmentService,
            $mdDialog) {

    PageTitle.set('Equipment');
    $scope.removePadding = true;

    $scope.status_icons = {
        active: 'directions_run',
        idle: 'local_hotel',
        error: 'error',
        broken: 'broken_image',
    };

    $scope.equipment_statuses = {
        idle: 'Idle',
        active: 'Active',
        error: 'Error',
        broken: 'Out of order',
    };

    EquipmentService.equipment().then(function(data) {
        $scope.equipment_list = data;
    });

    $scope.changeStatus = function(statusCode, equipment) {
        equipment.status = statusCode;
        equipment.status_display = $scope.equipment_statuses[statusCode];
        EquipmentService.updateEquipment(equipment.id,
                {status: statusCode});
    };

});

app.service('EquipmentService', function(Restangular) {

    this.equipment = function(params) {
        if (!params) {
            params = {};
        }
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
