import { inject } from 'aurelia-framework';
import { UserApi } from '../../auth/api';
import { SettingsTable } from '../settings-table';
import { ValidationRules } from 'aurelia-validation';

@inject(UserApi)
export class Group extends SettingsTable {

    constructor(userApi, ...rest) {
        super(...rest);

        this.api = userApi;

        this.setFunctions('group');
        this.createTemplate = './users/create-group.html';

        this.tableHeaders = [
            'Name',
        ];
        this.tableFields = [
            'name',
        ];

        this.item.permissions = [];

        ValidationRules
            .ensure('name').required()
            .on(this.item);
    }

    addPermission() {
        this.item.permissions.push(this.permission);
    }

    removePermission(index) {
        this.item.permissions.splice(index, 1);
    }
}
