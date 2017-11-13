import { inject } from 'aurelia-framework';
import { SharedApi } from '../../shared/api';
import { SettingsTable } from '../settings-table';
import { ValidationRules } from 'aurelia-validation';

@inject(SharedApi)
export class Measures extends SettingsTable {

    constructor(sharedApi, ...rest) {
        super(...rest);

        this.api = sharedApi;

        this.setFunctions('measure');
        this.createTemplate = './general/create-measure.html';

        this.tableHeaders = [
            'Symbol',
            'Name',
        ];
        this.tableFields = [
            'symbol',
            'name',
        ];

        ValidationRules
            .ensure('name').required()
            .ensure('symbol').required()
            .on(this.item);
    }
}
