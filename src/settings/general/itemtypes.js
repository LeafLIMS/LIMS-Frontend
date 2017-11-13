import { inject } from 'aurelia-framework';
import { SharedApi } from '../../shared/api';
import { SettingsTable } from '../settings-table';
import { ValidationRules } from 'aurelia-validation';

@inject(SharedApi)
export class ItemTypes extends SettingsTable {

    constructor(sharedApi, ...rest) {
        super(...rest);

        this.api = sharedApi;

        this.setFunctions('itemType');
        this.createTemplate = './general/create-itemtype.html';

        this.tableHeaders = [
            'Name',
            'Parent',
        ];
        this.tableFields = [
            'display_name',
            'parent',
        ];

        ValidationRules
            .ensure('name').required()
            .on(this.item);
    }
}
