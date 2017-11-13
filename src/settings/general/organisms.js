import { inject } from 'aurelia-framework';
import { SharedApi } from '../../shared/api';
import { SettingsTable } from '../settings-table';
import { ValidationRules } from 'aurelia-validation';

@inject(SharedApi)
export class Organisms extends SettingsTable {

    constructor(sharedApi, ...rest) {
        super(...rest);

        this.api = sharedApi;

        this.setFunctions('organism');
        this.createTemplate = './general/create-organism.html';

        this.tableHeaders = [
            'Name',
            'Common name',
        ];
        this.tableFields = [
            'name',
            'common_name',
        ];

        ValidationRules
            .ensure('name').required()
            .on(this.item);
    }
}
