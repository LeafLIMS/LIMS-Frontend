'use strict';

var app = angular.module('limsFrontend');

app.controller('DashboardCtrl', function($scope, PageTitle,
    UserService, ProjectService, EquipmentService, RunService) {

    PageTitle.set('Dashboard');

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

    UserService.getUserDetails(UserService.getUser().id).then(function(data) {
        console.log(data);
        if (data.first_name) {
            $scope.name = data.first_name;
        } else {
            $scope.name = data.username;
        }
    });

    ProjectService.projects({limit: 5, ordering: '-id'}).then(function(data) {
        $scope.projects = data;
    });

    var getEquipment = function() {
        EquipmentService.equipment({status: 'active'}).then(function(data) {
            $scope.activeEquipment = data;
        });

        EquipmentService.equipment({status: 'error'}).then(function(data) {
            $scope.errorEquipment = data;
        });
    };
    getEquipment();

    RunService.runs({limit: 5, is_active: 'True'}).then(function(data) {
        $scope.activeRuns = data;
    });

    $scope.changeStatus = function(statusCode, equipment) {
        equipment.status = statusCode;
        equipment.status_display = $scope.equipment_statuses[statusCode];
        EquipmentService.updateEquipment(equipment.id,
                {status: statusCode}).then(function(data) {
            getEquipment();
        });
    };

});
