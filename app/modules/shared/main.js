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
            text: 'Equipment Status', },
        {icon: 'build', state: 'app.tools',
            text: 'Tools', disabled: true, },
        {icon: 'settings_applications', state: 'app.configuration',
            text: 'Configuration', access: ['admin'], },
    ];

    $scope.toggleSidenav = function(menuLoc) {
        $mdSidenav(menuLoc).toggle();
    };

    $scope.user = UserService.getUser();

    $scope.hasAccess = function(item) {
        // Check if a user has access to this part of the
        // system. Defined in navigationItems array.
        if (item.access) {
            for (var i = 0; i < item.access.length; i++) {
                if ($scope.user.groups.indexOf(item.access[i]) !== -1) {
                    return true;
                }
            }
        } else {
            return true;
        }
        return false;
    };

    $scope.logout = function() {
        UserService.logout();
        $state.go('welcome');
    }

});

app.controller('WelcomeCtrl', function(loginModal, $state, $mdDialog,
    PageTitle, UserService) {

    PageTitle.set('GET LIMS');

    if (UserService.isLoggedIn()) {
        $state.go('app.dashboard');
    } else {
        loginModal().then(function() {
            $state.go('app.dashboard');
        }).catch(function(err) {
            console.log('caught here');
            $state.go('welcome');
        });
    }

});


app.controller('AccountCtrl', function($scope, PageTitle, UserService, CountryService,
            AddressService) {

    PageTitle.set('GeneMill: Account settings');

    UserService.getUserDetails(UserService.getUser().id).then(function(data) {
        $scope.user = data;
    });

    $scope.countries = CountryService;

    $scope.save = function() {
        var data = {
            first_name: $scope.user.first_name,
            last_name: $scope.user.last_name
        };
        UserService.updateUserDetails($scope.user.id, data);
    };

    $scope.changePassword = function() {
        if ($scope.new_password == $scope.confirm_new_password) {
            UserService.changePassword($scope.user.id, $scope.new_password);
        } else {
            $scope.noMatch = true;
        }
    };

    $scope.addAddress = function() {
        $scope.user.addresses.push({});
    };

    $scope.updateAddress = function() {
        _.each($scope.user.addresses, function(obj) {
            obj.user = UserService.getUser().username;
            if (obj.id) {
                AddressService.updateAddress(obj.id, obj);
            } else {
                AddressService.createAddress(obj);
            }
        });
    };

});

app.controller('FilePickerCtrl', function($scope, $mdDialog, AttachmentService,
            Upload, UserService) {

    $scope.locations = [
        {
            name: 'Uploaded',
        },
        {
            name: 'Equipment outputs',
        },
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

    $scope.$watch('chosenFile', function(n, o) {
        if (n) {
            console.log(n);
            var params = new FormData();
            params.append('added_by', UserService.getUser().username);
            params.append('filename', n);
            AttachmentService.addFile(params).then(function(data) {
                $scope.selectFile(data);
                $scope.choose();
            });
        }
    });

    $scope.filerFiles = function(searchText) {
        var params = {
            search: searchText,
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
        },
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

            scope.$watch('selected', function(n, o) {
                if (n) {
                    getFiltered();
                }
            }, true);

            scope.$watch('available', function(n) {
                if (n) {
                    getFiltered();
                }
            }, true);

            scope.toggleAll = function(status, list, source) {
                _.each(source, function(obj) {
                    scope.toggle(obj, list);
                });
            };

            scope.toggle = function(item, list) {
                var idx = list.indexOf(item);
                if (idx > -1) {
                    list.splice(idx, 1);
                }                else {
                    list.push(item);
                }
            };

            scope.isSelected = function(item, list) {
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
        },
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
        },
    }
});

app.service('PageTitle', function($rootScope) {
    this.set = function(title) {
        $rootScope.page_title = title;
    }
});

app.service('ErrorService', function() {

    this.parseError = function(error) {
        // There are multiple types of errors:
        // 1. Errors with data.message
        // 2. Thrown errors in an array
        // 3. Thrown errors in n dimensional array (e.g. 400)
        if (error.data.message) {
            return error.data.message;
        } else {
            if (Array.isArray(error.data)) {
                var result = '';
                for (var i = 0; i < error.data.length; i++) {
                    result += error.data[i] + '\n';
                }
                return result;
            }
        }
        return error.status + ': ' + error.statusText;
    };

});

app.service('AttachmentService', function(Restangular) {

    this.getFiles = function(params) {
        if (!params) {
            params = {}
        }
        return Restangular.all('attachments').getList(params);
    }

    this.addFile = function(data) {
        return Restangular.all('attachments')
            .withHttpConfig({transformRequest: angular.identity})
            .post(data, undefined, {
                'Content-Type': undefined,
            });
    };

    this.getFile = function(attachmentId) {
        return Restangular.one('attachments', attachmentId).get();
    };

    this.attachments = function(experimentId) {
        return Restangular.all('attachments').getList();
    };

});

app.directive('gtlPermissionsWidget', function(UserService, GroupService, PermissionsService) {
    return {
        restrict: 'E',
        scope: {
            inputData: '=',
        },
        templateUrl: 'modules/shared/views/gtl-permissions-widget.html',
        link: function($scope, elem, attrs) {
            $scope.permissions = {};

            if (!$scope.inputData) {
                $scope.inputData = {};
            }

            // Ignore these groups as they're assigned to every
            // user created so aren't too useful in this case.
            var ignoreGroups = ['user'];

            // Get user permissions
            // Auto assign current user group(s) as rw
            // Except for user
            var userId = UserService.getUser().id;
            var user;
            // Get the current user details so we can set the default
            // permissions for the item.
            UserService.getUserDetails(userId).then(function(data) {
                user = data;
                // Get all available groups.
                GroupService.groups().then(function(data) {
                    $scope.groups = data;
                    if ($scope.inputData.id) {
                        var inputDataPerms = $scope.inputData.permissions;
                        var objectPermissionGroups = Object.keys(inputDataPerms);
                        _.each($scope.groups, function(group) {
                            if (objectPermissionGroups.indexOf(group.name) !== -1) {
                                group.assigned = true;
                                var hasChange = _.find(inputDataPerms[group.name],
                                    function(o) {
                                    if (_.startsWith(o, 'change_')) {
                                        return true;
                                    }
                                    return false;
                                });
                                if (hasChange) {
                                    group.permissions = 'rw';
                                } else {
                                    group.permissions = 'r';
                                }
                                $scope.permissions[group.name] = 'rw';
                            }
                        });
                    } else {
                        // Set the right permissions/assigned groups
                        // for the interface to read.
                        _.each($scope.groups, function(group) {
                            if (user.groups.indexOf(group.name) !== -1 &&
                               ignoreGroups.indexOf(group.name) == -1) {
                                group.assigned = true;
                                group.permissions = 'rw';
                                $scope.permissions[group.name] = 'rw';
                            }
                        });
                        $scope.inputData.assign_groups = $scope.permissions;
                    }
                });
            });

            $scope.setGroupEnabled = function(group) {
                if (group.assigned) {
                    delete $scope.permissions[group.name];
                    // Call remove permission API
                    if ($scope.inputData.id) {
                        PermissionsService.removePermissions($scope.inputData.route,
                                                             $scope.inputData.id,
                                                             [group.name]);
                    }
                } else {
                    $scope.permissions[group.name] = 'r';
                    group.permissions = 'r';
                    // Call set permission API
                    if ($scope.inputData.id) {
                        PermissionsService.setPermissions($scope.inputData.route,
                                                          $scope.inputData.id,
                                                          $scope.permissions);
                    }
                }
            };

            $scope.setPermissionValue = function(group) {
                // Update the permissions scope object with correct
                // values from group.
                $scope.permissions[group.name] = group.permissions;
                if ($scope.inputData.id) {
                    // Use the permisions API to set things as object exists
                    PermissionsService.setPermissions($scope.inputData.route,
                                                      $scope.inputData.id,
                                                      $scope.permissions);
                }
            }
        },
    }
});

app.service('PermissionsService', function(Restangular) {
    // If it has a path you can get it from the Restangular
    // object and pass it to the service!
    // You won't need it for unsaved as sent with request :)
    this.setPermissions = function(sourceUrl, objectId, permissions) {
        return Restangular.one(sourceUrl, objectId).customOperation('patch',
                                                                    'set_permissions',
                                                                    null,
                                                                    null,
                                                                    permissions);
    }

    this.removePermissions = function(sourceUrl, objectId, groups) {
        return Restangular.one(sourceUrl, objectId).customDELETE('remove_permissions',
                                                                 {groups: groups});
    }
});

app.service('AddressService', function(Restangular) {

    this.updateAddress = function(addressId, addressData) {
        Restangular.one('addresses', addressId).patch(addressData);
    };

    this.createAddress = function(addressData) {
        Restangular.all('addresses').post(addressData);
    };

});
