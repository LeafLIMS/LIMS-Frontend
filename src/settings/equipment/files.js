import { inject } from 'aurelia-framework';
import { EquipmentApi } from '../../equipment/api';
import { SettingsTable } from '../settings-table';
import { ValidationRules } from 'aurelia-validation';

@inject(EquipmentApi)
export class EquipmentFiles extends SettingsTable {

    constructor(equipmentApi, ...rest) {
        super(...rest);

        this.api = equipmentApi;

        this.setFunctions('copyfile');
        this.createTemplate = './equipment/create-files.html';

        this.tableHeaders = [
            'Name',
            'Equipment',
            'From prefix',
            'To prefix',
            'Enabled',
        ];
        this.tableFields = [
            'name',
            'equipment',
            'from_prefix',
            'to_prefix',
            'is_enabled',
        ];

        ValidationRules
            .ensure('name').required()
            .ensure('equipment').required()
            .on(this.item);
    }

    addLocation() {
        if (!this.item.locations) {
            this.item.locations = [];
        }
        let location = {};
        this.item.locations.push(location);
    }

    removeLocation(index) {
        this.item.locations.splice(index, 1);
    }
}
