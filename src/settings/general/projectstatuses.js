import { inject } from 'aurelia-framework';
import { ProjectApi } from '../../projects/api';
import { SettingsTable } from '../settings-table';
import { ValidationRules } from 'aurelia-validation';

@inject(ProjectApi)
export class ProjectStatuses extends SettingsTable {

    constructor(projectApi, ...rest) {
        super(...rest);

        this.api = projectApi;

        this.setFunctions('projectStatus');
        this.getFunc = 'projectStatuses';
        this.createTemplate = './general/create-productstatus.html';

        this.tableHeaders = [
            'Name',
            'Description',
        ];
        this.tableFields = [
            'name',
            'desciption',
        ];

        ValidationRules
            .ensure('name').required()
            .on(this.item);
    }
}
