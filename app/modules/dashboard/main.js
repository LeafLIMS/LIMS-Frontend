'use strict';

var app = angular.module('limsFrontend');

app.controller('DashboardCtrl', function($scope, PageTitle) {

    console.log('hello, this is dog');

    PageTitle.set('Dashboard');

});
