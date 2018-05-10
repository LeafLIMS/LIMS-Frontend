import { inject, bindable, bindingMode } from 'aurelia-framework';
import { UserApi } from '../../auth/api';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(UserApi, EventAggregator)
export class LlPermissions {
    @bindable({defaultBindingMode: bindingMode.twoWay}) objectFor;
    @bindable({defaultBindingMode: bindingMode.twoWay}) reset;
    @bindable object;

    constructor(api, eventAggregator) {
        this.api = api;
        this.ea = eventAggregator;
        this.selected = [];
        this.perms = {};
        this.error = null;

        this.fromServer = false;
    }

    buildPerms() {
        var assigned_permissions = {};
        this.selected = [];
        this.perms = {};
        this.api.groups().then(data => {
            this.groups = data;
            if ('permissions' in this.objectFor) {
                for (var group in this.objectFor.permissions) {
                    assigned_permissions[group] = 'r';
                    this.perms[group] = 'r';
                    for (var perm in this.objectFor.permissions[group]) {
                        let perm_string = this.objectFor.permissions[group][perm];
                        if (perm_string.startsWith('change_')) {
                            assigned_permissions[group] = 'rw';
                            this.perms[group] = 'rw';
                        }
                    }
                    if (this.selected.indexOf(group) == -1) {
                        this.selected.push(group);
                    }
                }
            } else {
                for (var g in this.groups.results) {
                    let group = this.groups.results[g];
                    if (group.name !== 'user') {
                        assigned_permissions[group.name] = 'rw';
                        this.perms[group.name] = 'rw';
                        if (this.selected.indexOf(group.name) == -1) {
                            this.selected.push(group.name);
                        }
                    }
                }
            }
            this.objectFor.assign_groups = assigned_permissions;
        });
    }

    resetChanged(n) {
        // Reset permissions list and rebuild when cancelled to ensure
        // when cancelled that permissions are not saved in the UI
        if (!n) {
            this.perms = {};
            this.buildPerms();
        }
    }

    objectForChanged(n) {
        if (this.objectFor && 'permissions' in this.objectFor && !this.fromServer) {
            this.buildPerms();
            this.fromServer = true;
        } else if (this.objectFor && Object.keys(this.perms).length == 0) {
            this.buildPerms();
        }
    }

    toggled(group) {
        if (group in this.objectFor.assign_groups) {
            delete this.objectFor.assign_groups[group];
            this.perms[group] = false;
            if (this.objectFor.id) {
                this.api.removePermissions(this.object, this.objectFor.id, group)
                    .catch(err => {
                    this.error = err;
                });
            }
        } else {
            this.objectFor.assign_groups[group] = 'r';
            this.perms[group] = 'r';
            if (this.objectFor.id) {
                this.api.setPermissions(this.object, this.objectFor.id,
                                        this.objectFor.assign_groups)
                    .catch(err => {
                    this.error = err;
                });
            }
        }
    }

    setPerm(group, value) {
        this.objectFor.assign_groups[group] = value;
        this.perms[group] = value;
        if (this.objectFor.id) {
            this.api.setPermissions(this.object, this.objectFor.id, this.objectFor.assign_groups)
                .catch(err => {
                this.error = err;
            });
        }
    }
}
