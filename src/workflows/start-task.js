import { inject, NewInstance } from 'aurelia-framework';
import { WorkflowApi } from './api';
import { ValidationRules, ValidationController, validateTrigger } from 'aurelia-validation';
import { UiValidationRenderer } from '../components/semantic-ui/ui-validation-renderer';
import {Router} from 'aurelia-router';

@inject(WorkflowApi, NewInstance.of(ValidationController), Router)
export class StartTask {

    constructor(workflowApi, validationController, router) {
        this.api = workflowApi;
        this.router = router;
        this.isLoading = true;

        this.validator = validationController;
        this.validator.validateTrigger = validateTrigger.changeOrBlur;
        this.validator.addRenderer(new UiValidationRenderer());

        this.setup = true;
        this.complete = false;
        this.requirements = false;

        this.taskData = {}

        this.validationRuleset = {
            input_fields: ValidationRules
                                .ensure('amount').required()
                                .matches(/^-?[0-9.]+/)
                                .ensure('inventory_identifier').required()
                                .rules,
            output_fields: ValidationRules
                                .ensure('amount').required()
                                .matches(/^-?[0-9.]+/)
                                .rules,
            variable_fields: ValidationRules
                                .ensure('amount').required()
                                .matches(/^-?[0-9.]+/)
                                .rules,
            calculation_fields: ValidationRules
                                    .ensure('calculation').required()
                                    .rules,
        }

        ValidationRules
            .ensure('equipment_choice').required()
            .ensure('labware_identifier').required()
            .when(obj => !obj.labware_not_required)
            .on(this.taskData);
    }

    activate(params, routeMap) {
        this.api.runDetail(params.id).then(data => {
            this.run = data;
            routeMap.navModel.title = this.run.name;

            this.taskId = this.run.tasks[this.run.current_task].id;
            this.taskPosition = this.run.current_task + 1;
            this.api.taskDetail(this.taskId).then(data => {
                this.isLoading = false;
                this.task = data;
                this.generateTaskData();
            });
        });
    }

    generateTaskData() {
        // Defaults required for submission
        this.taskData.product_input = this.task.product_input;
        this.taskData.product_input_measure = this.task.product_input_measure;
        this.taskData.product_input_amount = this.task.product_input_amount;
        this.taskData.labware_amount = this.task.labware_amount;
        this.taskData.labware_not_required = this.task.labware_not_required;

        var rules = [];

        let field_types = ['input_fields', 'variable_fields', 'output_fields',
                           'calculation_fields', 'step_fields'];
        for (let ft of field_types) {
            for (let field of this.task[ft]) {
                if (!this.taskData[ft]) {
                    this.taskData[ft] = [];
                }
                let fieldObj = {};
                this.taskData[ft].push(fieldObj);
                // Validation rUUUUUULES!
                if (ft !== 'step_fields') {
                    this.validator.addObject(fieldObj, this.validationRuleset[ft]);
                }
            }
        }
    }

    toggleSection(section) {
        if (this[section]) {
            this[section] = false;
        } else {
            this[section] = true;
        }
    }

    save() {
        this.validator.validate().then(results => {
            if (results.valid) {
                let frmData = new FormData();
                frmData.append('task', JSON.stringify(this.taskData));
                /*
                for (let key in this.taskData) {
                    if (key !== 'input_files') {
                        frmData.append(key, JSON.stringify(this.taskData[key]));
                    } else {
                        for (let fl in this.taskData.input_files) {
                            frmData.append(key, this.taskData.input_files[fl], fl);
                        }
                    }
                }
                */
                if (this.canStart) {
                    console.log(this.complete);
                    this.api.startTask(this.run.id, frmData).then(response => {
                        response.json().then(data => {
                            if (this.complete) {
                                this.router.navigateToRoute('finishTask', {id: this.run.id});
                            } else {
                                this.router.navigateToRoute('performTask', {id: this.run.id});
                            }
                        }).catch(err => {
                            this.error = err;
                        });
                    }).catch(err => {
                        this.error = err;
                    });
                } else {
                    this.setup = false;
                    this.requirements = true;
                    this.loadingRequirements = true;
                    // TODO: If errors then show that, set this.hasError in the UI
                    // to show things
                    this.api.checkTask(this.run.id, frmData).then(response => {
                        response.json().then(data => {
                            if (response.status == 200) {
                                this.taskRequirements = data;
                                this.loadingRequirements = false;
                                if (data.errors.length == 0 && data.equipment_status == 'idle') {
                                    this.canStart = true;
                                }
                            } else {
                                this.loadingRequirements = false;
                                this.error = response;
                            }
                        }).catch(err => {
                            this.error = err;
                            this.loadingRequirements = false;
                        });
                    }).catch(err => {
                        console.log('ERROR?', err);
                        this.error = err;
                        this.loadingRequirements = false;
                    });
                }
            }
        });
    }

}
