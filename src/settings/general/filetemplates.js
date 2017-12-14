import { inject } from 'aurelia-framework';
import { FiletemplateApi } from '../../filetemplates/api';
import { SettingsTable } from '../settings-table';
import { ValidationRules } from 'aurelia-validation';
import { FiletemplateWizard } from './filetemplate-wizard';

@inject(FiletemplateApi)
export class FileTemplates extends SettingsTable {

    constructor(filetemplateApi, ...rest) {
        super(...rest);

        this.api = filetemplateApi;

        this.setFunctions('filetemplate');
        this.createTemplate = './general/create-filetemplate.html';

        this.tableHeaders = [
            'Name',
            'Template purpose',
        ];
        this.tableFields = [
            'name',
            'file_for',
        ];

        ValidationRules
            .ensure('name').required()
            .ensure('file_for').required()
            .on(this.item);

        if (!this.item.fields) {
            this.item.fields = [];
        }

        this.showWizard = () => {
            this.dialog.open({viewModel: FiletemplateWizard, model: this.item})
                .whenClosed(response => {
                if (!response.wasCancelled) {
                    this.save();
                }
            });
        }

        this.extraToolbarButtons = [
            {text: 'Wizard', icon: 'wizard', action: this.showWizard}
        ]
    }

    addField() {
        this.item.fields.push({});
    }

    removeField(index) {
        this.item.fields.splice(index, 1);
    }
}
