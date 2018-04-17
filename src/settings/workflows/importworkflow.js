import { inject, BindingEngine, NewInstance } from 'aurelia-framework';
import { ValidationRules, ValidationController, validateTrigger } from 'aurelia-validation';
import { UiValidationRenderer } from '../../components/semantic-ui/ui-validation-renderer';
import { DialogController } from 'aurelia-dialog';
import { WorkflowApi } from '../../workflows/api';
import { SharedApi } from '../../shared/api';
import { FiletemplateApi } from '../../filetemplates/api';

@inject(Element, DialogController, BindingEngine, WorkflowApi,
        NewInstance.of(ValidationController), SharedApi, FiletemplateApi)
export class ImportWorkflow {

    constructor(element, dialogController, bindingEngine, workflowApi, validationController,
                sharedApi, filetemplateApi) {
        this.dialog = dialogController;
        this.be = bindingEngine;
        this.api = workflowApi;
        this.sharedApi = sharedApi;
        this.filetemplateApi = filetemplateApi;

        this.validator = validationController;
        this.validator.validateTrigger = validateTrigger.changeOrBlur;
        this.validator.addRenderer(new UiValidationRenderer());

        this.fileError = false;
        this.workflowData = {};

        this.buildWorkflowData = () => {
            this.workflowData.name = this.parsedFile.workflow.name;
            this.workflowData.workflow = this.parsedFile.workflow;
            this.workflowData.tasks = this.parsedFile.tasks;

            this.item = this.workflowData.tasks[0];

            this.doDataCheck();
            this.handleTaskChange();
        }

        this.doDataCheck = () => {
            let importCheckData = {
                name: this.workflowData.name,
                data: this.parsedFile,
                assign_groups: {staff: 'rw'},
                check: true,
            }

            this.api.importWorkflow(importCheckData).then(response => {
                this.requiredItems = response.required;
                this.importIssues = response.issues;
                console.log(response);
            }).catch(err => {
                console.log('ERROR', err);
            });
        }

    }

    handleTaskChange() {
        this.validationRuleset = {
            input_fields: ValidationRules
                                .ensure('label').required()
                                .ensure('amount').required()
                                .matches(/^-?[0-9.]+/)
                                .ensure('measure').required()
                                .ensure('lookup_type').required()
                                .ensure('calculation_used').required()
                                .when(obj => obj.from_calculation)
                                .rules,
            output_fields: ValidationRules
                                .ensure('label').required()
                                .ensure('amount').required()
                                .matches(/^-?[0-9.]+/)
                                .ensure('measure').required()
                                .ensure('lookup_type').required()
                                .ensure('calculation_used').required()
                                .when(obj => obj.from_calculation)
                                .rules,
            variable_fields: ValidationRules
                                .ensure('label').required()
                                .ensure('amount').required()
                                .matches(/^-?[0-9.]+/)
                                .ensure('measure').required()
                                .when(obj => !obj.measure_not_required)
                                .rules,
            calculation_fields: ValidationRules
                                    .ensure('label').required()
                                    .ensure('calculation').required()
                                    .rules,
            step_fields: ValidationRules
                                .ensure('label').required()
                                .rules,
        }

        this.applyValidation();

        // Calculation fields need to be handled seperatly so they can be correctly referenced
        this.fieldTypes = ['input_fields', 'output_fields', 'step_fields', 'variable_fields'];

        this.removedFields = [];
        this.calculations = [];

        this.equipmentObserver = this.be.propertyObserver(this.item, 'capable_equipment_source')
            .subscribe((n, o) => {
            if (!this.item.capable_equipment) {
                this.item.capable_equipment = [];
            }
            this.item.capable_equipment.push(n);
        });

        this.equipmentFileObserver = this.be.propertyObserver(this.item,
            'equipment_files_source').subscribe((n, o) => {
            if (!this.item.equipment_files) {
                this.item.equipment_files = [];
            }
            this.item.equipment_files.push(n);
        });

        this.inputFileObserver = this.be.propertyObserver(this.item, 'input_files_source')
            .subscribe((n, o) => {
            if (!this.item.input_files) {
                this.item.input_files = [];
            }
            this.item.input_files.push(n);
        });

        this.outputFileObserver = this.be.propertyObserver(this.item, 'output_files_source')
            .subscribe((n, o) => {
            if (!this.item.output_files) {
                this.item.output_files = [];
            }
            this.item.output_files.push(n);
        });
    }

    applyValidation() {
        ValidationRules
            .ensure('name').required()
            .ensure('product_input_amount').required()
            .when(elem => !elem.product_input_not_required)
            .ensure('product_input').required()
            .when(elem => !elem.product_input_not_required)
            .ensure('product_input_measure').required()
            .when(elem => !elem.product_input_not_required)
            .ensure('labware').required()
            .when(elem => !elem.labware_not_required)
            .on(this.item);
    }

    addItem(item) {
        if (item.item_type == 'ItemType') {
            item.parent = 'Item';
            this.sharedApi.createItemType(item).then(response => {
                this.doDataCheck();
            });
        } else if (item.item_type == 'FileTemplate') {
            this.filetemplateApi.createFiletemplate(item).then(response => {
                this.doDataCheck();
            });
        } else if (item.item_type == 'AmountMeasure') {
            this.sharedApi.createMeasure(item).then(response => {
                this.doDataCheck();
            });
        }
    }

    setTask(index) {
        this.item = this.workflowData.tasks[index];
        this.handleTaskChange();
    }

    fileUploaded(event) {
        let reader = new FileReader();
        reader.readAsText(this.importedFile[0], "UTF-8");
        reader.onload = e => {
            try {
                this.fileError = false;
                this.parsedFile = JSON.parse(e.target.result);
                this.buildWorkflowData();
            } catch(error) {
                this.fileError = true;
                console.log('could not parse file!');
            }
        }
    }

    save() {
        this.workflowData.data = {
            workflow: this.workflowData.workflow,
            tasks: this.workflowData.tasks,
        }
        this.api.importWorkflow(this.workflowData).then(response => {
            this.dialog.ok();
        }).catch(err => {
            this.doDataCheck();
        });
    }

}
