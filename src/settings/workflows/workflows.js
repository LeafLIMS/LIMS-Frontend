import { inject } from 'aurelia-framework';
import { WorkflowApi } from '../../workflows/api';
import { SettingsTable } from '../settings-table';
import { ValidationRules } from 'aurelia-validation';
import { ExportWorkflow } from './exportworkflow';
import { ImportWorkflow } from './importworkflow';

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

        this.importWorkflow = () => {
            this.dialog.open({viewModel: ImportWorkflow})
                .whenClosed(response => {
                if (!response.wasCancelled) {
                    console.log('import workflow');
                }
            });
        }

        this.exportWorkflow = () => {
            this.dialog.open({viewModel: ExportWorkflow})
                .whenClosed(response => {
                if (!response.wasCancelled) {
                    // Set up file to be downloaded
                    this.api.exportWorkflow(response.output).then(data => {
                        let asText = JSON.stringify(data);
                        let a = document.createElement('a');
                        document.body.appendChild(a);
                        let fileBlob = new Blob([asText], {type: 'text/plain'});
                        this.fileUrl = URL.createObjectURL(fileBlob);
                        a.href = this.fileUrl;
                        a.download = data.workflow.name + '.workflow'
                        a.click();
                        document.body.removeChild(a);
                    });
                }
            });
        }

        this.extraToolbarButtons = [
            {text: 'Export', icon: 'upload', action: this.exportWorkflow},
            {text: 'Import', icon: 'download', action: this.importWorkflow}
        ]
    }

    edit(item) {
        super.edit(item);
        // Get a list of tasks that are available
        this.api.getWorkflowTasks(item.id).then(data => {
            this.taskList = data['tasks'];
        });
    }

    addTask() {
        if (this.taskToAdd) {
            this.api.taskDetail(this.taskToAdd).then(data => {
                console.log(data);
                this.taskList.push(data);
            });
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
