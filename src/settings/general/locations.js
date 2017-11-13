import { inject } from 'aurelia-framework';
import { SharedApi } from '../../shared/api';
import { SettingsTable } from '../settings-table';
import { ValidationRules } from 'aurelia-validation';

@inject(SharedApi)
export class Locations extends SettingsTable {

    constructor(sharedApi, ...rest) {
        super(...rest);

        this.api = sharedApi;

        this.setFunctions('location');
        this.createTemplate = './general/create-location.html';

        this.tableHeaders = [
            'Name',
            'Code',
            'Parent',
        ];
        this.tableFields = [
            'display_name',
            'code',
            'parent_name',
        ];

        ValidationRules
            .ensure('name').required()
            .ensure('code').required()
            .on(this.item);
    }
}
