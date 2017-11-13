import { inject } from 'aurelia-framework';
import { WorkflowApi } from '../../workflows/api';
import { SettingsTable } from '../settings-table';
import { ValidationRules } from 'aurelia-validation';

@inject(WorkflowApi)
export class Workflows extends SettingsTable {

    constructor(workflowApi, ...rest) {
        super(...rest);

        this.api = workflowApi;

        this.setFunctions('workflow');
        this.createTemplate = './workflows/create-workflow.html';

        this.tableHeaders = [
            'Name',
            'Created by',
        ];
        this.tableFields = [
            'name',
            'created_by',
        ];

        ValidationRules
            .ensure('name').required()
            .ensure('order').required()
            .on(this.item);
    }

    edit(item) {
        super.edit(item);
        // Get a list of tasks that are available
        this.api.tasks().then(data => {
            this.availableTasks = data;
            this.taskList = this.item.order.split(',').map(x => {
                return this.availableTasks.results.find(y => { return y.id == parseInt(x) });
            });
        });
    }

    create() {
        super.create();
        this.api.tasks().then(data => {
            this.availableTasks = data;
        });
    }

    addTask() {
        if (this.taskToAdd) {
            this.taskList.push(this.availableTasks.results.find(y => {
                return y.id == parseInt(this.taskToAdd);
            }));
        }
    }

    removeTask(index) {
        this.taskList.splice(index, 1);
    }

    makeOrder() {
        this.item.order = this.taskList.map(x => { return x.id}).join(',');
    }

    save() {
        this.makeOrder();
        super.save();
    }

    update() {
        this.makeOrder();
        super.update();
    }
}
