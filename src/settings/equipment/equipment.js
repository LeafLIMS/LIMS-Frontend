import { inject } from 'aurelia-framework';
import { EquipmentApi } from '../../equipment/api';
import { SettingsTable } from '../settings-table';
import { ValidationRules } from 'aurelia-validation';

@inject(EquipmentApi)
export class Equipment extends SettingsTable {

    constructor(workflowApi, ...rest) {
        super(...rest);

        this.api = workflowApi;

        this.setFunctions('equipment');
        this.getFunc = 'equipment';
        this.createTemplate = './equipment/create-equipment.html';

        this.tableHeaders = [
            'Name',
            'Location',
            'Status',
            'Reservable',
        ];
        this.tableFields = [
            'name',
            'location_display',
            'status_display',
            'can_reserve',
        ];

        ValidationRules
            .ensure('name').required()
            .ensure('location').required()
            .on(this.item);
    }
}
