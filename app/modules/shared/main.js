'use strict';

var app = angular.module('limsFrontend');

app.controller('AppCtrl', function($scope, $mdSidenav, UserService, $state) {

    $scope.navigationItems = [
        {icon: 'dashboard', state: 'app.dashboard', text: 'Dashboard'},
        {icon: 'receipt', state: 'app.orders', text: 'Orders'},
        {icon: 'assignment', state: 'app.projects', text: 'Projects'},
        {icon: 'linear_scale', state: 'app.workflows', text: 'Workflows'},
        {icon: 'store', state: 'app.inventory', text: 'Inventory'},
        {icon: 'devices_other', state: 'app.equipment', 
            text: 'Equipment Status'},
        {icon: 'build', state: 'app.tools', 
            text: 'Tools', disabled: true},
        {icon: 'settings_applications', state: 'app.configuration', 
            text: 'Configuration'}
    ];

    $scope.toggleSidenav = function(menuLoc) {
        $mdSidenav(menuLoc).toggle();
    };

    $scope.user = UserService.getUser();

    $scope.logout = function() {
        UserService.logout();
        $state.go('welcome');
    }

});

app.controller('WelcomeCtrl', function(loginModal, $state, $mdDialog,
    PageTitle, UserService) {

    PageTitle.set('GET LIMS');

    if(UserService.isLoggedIn()) {
        $state.go('app.dashboard');
    } else {
        loginModal().then(function() {
            $state.go('app.dashboard');
        }).catch(function(err) {
            console.log('caught here');
        });
    }

});

app.controller('FilePickerCtrl', function($scope, $mdDialog, AttachmentService, 
            Upload, UserService) {

    $scope.locations = [
        {
            name: 'Uploaded',
        },
        {
            name: 'Equipment outputs'
        }
    ]

    $scope.selectedLocation = $scope.locations[0];
    $scope.setLocation = function(loc) {
        $scope.selectedLocation = loc;
    };

    AttachmentService.getFiles().then(function(data) {
        $scope.availableFiles = data;
    }); 

    $scope.selectFile = function(chosenFile) {
        $scope.selectedFile = chosenFile;
    };

    $scope.$watch('chosenFile', function(n,o) {
        if(n) {
            console.log(n);
            var params = new FormData();
            params.append('added_by', UserService.getUser().username);
            params.append('filename', n);
            AttachmentService.addFile(params).then(function(data) {;
                $scope.selectFile(data);
                $scope.choose();
            });
        };
    });

    $scope.filerFiles = function(searchText) {
        var params = {
            search: searchText
        }
    };

    $scope.cancel = function() {
        return $mdDialog.cancel();
    };

    $scope.choose = function() {
        return $mdDialog.hide($scope.selectedFile);
    };

});

app.directive('gmColourButton', function() {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'modules/shared/views/gm-colour-button.html',
        link: function(scope, elem, attrs) {
            scope.text = attrs.text;
            scope.icon = attrs.icon;
            elem.attr('layout', 'column');
            elem.attr('layout-align', 'center');
            elem.addClass('gm-colour-button');
        }
    }
});

app.directive('gmMultiSelect', function() {
    return {
        restrict: 'E',
        scope: {
            available: '=',
            selected: '=',
        },
        templateUrl: 'modules/shared/views/gmmultiselect.html',
        link: function(scope, elem, attr) {

			scope.selectedAvailable = [];
			scope.selectedSelected = [];
            scope.filtered = [];

            scope.selectAvailableStatus = false;
            scope.selectSelectedStatus = false;

            var getFiltered = function() {
                scope.filtered = _.filter(scope.available, function(obj) {
                    return scope.selected.indexOf(obj) == -1;
                });
            }

            scope.$watch('selected', function(n,o) {
                if(n) {
                    getFiltered();
                }
            }, true);

            scope.$watch('available', function(n) {
                if(n) {
                    getFiltered();
                }
            }, true);

            scope.toggleAll = function(status, list, source) {
                _.each(source, function(obj) {
                    scope.toggle(obj, list);
                });
            };

			scope.toggle = function (item, list) {
			    var idx = list.indexOf(item);
			    if (idx > -1) {
			      list.splice(idx, 1);
			    }
			    else {
			      list.push(item);
			    }
			};

			scope.isSelected = function (item, list) {
				return list.indexOf(item) > -1;
			};

            scope.addToSelected = function(list) {
                scope.selected = scope.selected.concat(list);
            };

            scope.removeFromSelected = function(list) {
                _.each(list, function(obj) {
                    var idx = scope.selected.indexOf(obj)
			        scope.selected.splice(idx, 1);
                });
            };
        }
    }
});

app.directive('pageTitle', function($rootScope) {
    return {
        restrict: 'A',
        template: '{{ title }}',
        link: function($scope, elem, attr) {
            $rootScope.$watch('page_title', function(n) {
                $scope.title = n;
            });
        }
    }
});

app.service('PageTitle', function($rootScope) {
    this.set = function(title) {
        $rootScope.page_title = title;
    }
});

app.service('AttachmentService', function(Restangular) {

    this.getFiles = function(params) {
        if(!params) {
            params = {}
        }
        return Restangular.all('attachments').getList(params);
    }

    this.addFile = function(data) {
        return Restangular.all('attachments')
            .withHttpConfig({transformRequest: angular.identity})
            .post(data, undefined, {
                'Content-Type': undefined
            });
    };

    this.getFile = function(attachmentId) {
        return Restangular.one('attachments', attachmentId).get();
    };

    this.attachments = function(experimentId) {
        return Restangular.all('attachments').getList();
    };

});
