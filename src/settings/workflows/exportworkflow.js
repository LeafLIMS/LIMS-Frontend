import { inject, BindingEngine } from 'aurelia-framework';
import { ValidationRules } from 'aurelia-validation';
import { DialogController } from 'aurelia-dialog';
import { WorkflowApi } from '../../workflows/api';

@inject(Element, DialogController, BindingEngine, WorkflowApi)
export class ExportWorkflow {

    constructor(element, dialogController, bindingEngine, workflowApi) {
        this.dialog = dialogController;
        this.be = bindingEngine;
        this.api = workflowApi;

        this.hasFile = false;
    }

    getFile(selected) {
        this.api.exportWorkflow(selected).then(response => {
            this.hasFile = true;
            let fileBlob = new Blob([response], {type: 'text/plain'});
            this.fileUrl = URL.createObjectURL(fileBlob);
        });
    }
}
