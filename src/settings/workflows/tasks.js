import { inject, BindingEngine } from 'aurelia-framework';
import { WorkflowApi } from '../../workflows/api';
import { SharedApi } from '../../shared/api';
import { EquipmentApi } from '../../equipment/api';
import { SettingsTable } from '../settings-table';
import { ValidationRules } from 'aurelia-validation';

@inject(WorkflowApi, SharedApi, EquipmentApi, BindingEngine)
export class Tasks extends SettingsTable {

    constructor(workflowApi, sharedApi, equipmentApi, bindingEngine, ...rest) {
        super(...rest);

        this.api = workflowApi;
        this.sharedApi = sharedApi;
        this.equipmentApi = equipmentApi;
        this.be = bindingEngine;

        this.setFunctions('task');
        this.createTemplate = './workflows/create-task.html';

        this.tableHeaders = [
            'Name',
            'Description',
            'Created by',
        ];
        this.tableFields = [
            'name',
            'description',
            'created_by',
        ];

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

    parseItem(item) {
        // Convert array to string for equipment
        //item.capable_equipment = item.capable_equipment.join(',');
        this.calculations = item.calculation_fields.slice(0);
        // Need to process fields so they use labels not id's for the calculation.
        // They will be converted back on a save.
        for (let fieldType of this.fieldTypes) {
            if (item[fieldType]) {
                for (let field of item[fieldType]) {
                    if (field.from_calculation) {
                        let calc = this.calculations.find(x => x.id == field.calculation_used);
                        field.calculation_used = calc.label;
                    }
                    this.validator.addObject(field, this.validationRuleset[fieldType]);
                }
            }
        }
        return item;
    }

    edit(item) {
        let parsedItem = this.parseItem(item);
        super.edit(parsedItem);
    }

    createOrUpdateFields(templateId) {
        let fields = [];
        for (let fieldType of this.fieldTypes) {
            let fieldParam = fieldType.split('_');
            if (this.item[fieldType]) {
                for (let field of this.item[fieldType]) {
                    if (field.from_calculation) {
                        let calc = this.calculations.find(x => {
                            return x.label == field.calculation_used
                        });
                        field.calculation_used = calc.id;
                    }
                    if (field.id) {
                        fields.push(this.api.updateTaskField(field.id, field, fieldParam[0]));
                    } else {
                        field.template = templateId;
                        fields.push(this.api.createTaskField(field, fieldParam[0]));
                    }
                }
            }
        }
        return fields;
    }

    save() {
        // Break up fields into different types
        // Save task
        // Save fields
        this.validator.validate().then(results => {
            if (results.valid) {
                this.isSaving = true;
                this.api[this.saveFunc](this.item).then(data => {
                    let fields;
                    // Need to create calculation fields first
                    // Then take those ID's and assign to calculations list
                    // Use this to assign proper ID's to fields that use calculations
                    if (this.item.calculation_fields && this.item.calculation_fields.length > 0) {
                        let calculations = [];
                        for (let field of this.item.calculation_fields) {
                            field.template = data.id;
                            calculations.push(this.api.createTaskField(field, 'calculation'));
                        }
                        Promise.all(calculations).then(response => {
                            for (let c of response) {
                                let calc = this.calculations.find(x => x.label == c.label);
                                calc.id = c.id;
                            }
                            fields = this.createOrUpdateFields(data.id);
                        }).catch(err => {
                            this.isSaving = false;
                            this.error = err;
                        });
                    } else {
                        fields = this.createOrUpdateFields(data.id);
                    }
                    Promise.all(fields).then(response => {
                        this.isSaving = false;
                        this.getData();
                        this.cancel();
                    }).catch(err => {
                        this.isSaving = false;
                        this.error = err;
                    });
                }).catch(err => {
                    this.isSaving = false;
                    this.error = err;
                });
            }
        });
    }

    _doUpdate(fields) {
        // All removed fields are added to the removedFields list. If they have been
        // added to the DB (e.g. have ID) remove via API.
        for (let f of this.removedFields) {
            if (f.id) {
                fields.push(this.api.deleteTaskField(f.id, f.field_type));
            }
        }
        Promise.all(fields).then(response => {
            this.isSaving = false;
            this.removedFields = [];
            this.getData();
            this.cancel();
        }).catch(err => {
            this.isSaving = false;
            this.error = err;
        });
    }

    update() {
        // Divide into new/update fields by ID presence
        // Iterate through removed fields and delete
        //super.update();
        this.validator.validate().then(results => {
            if (results.valid) {
                this.api[this.updateFunc](this.item.id, this.item).then(data => {
                    let fields;
                    // Need to create calculation fields first
                    // Then take those ID's and assign to calculations list
                    // Use this to assign proper ID's to fields that use calculations
                    if (this.item.calculation_fields && this.item.calculation_fields.length > 0) {
                        let calculations = [];
                        for (let field of this.item.calculation_fields) {
                            if (field.id) {
                                calculations.push(this.api.updateTaskField(field.id, field,
                                                                           'calculation'));
                            } else {
                                field.template = data.id;
                                calculations.push(this.api.createTaskField(field, 'calculation'));
                            }
                        }
                        Promise.all(calculations).then(response => {
                            for (let c of response) {
                                let calc = this.calculations.find(x => x.label == c.label);
                                calc.id = c.id;
                            }
                            fields = this.createOrUpdateFields(data.id);
                            this._doUpdate(fields);
                        }).catch(err => {
                            this.isSaving = false;
                            this.error = err;
                        });
                    } else {
                        fields = this.createOrUpdateFields(data.id);
                        this._doUpdate(fields);
                    }
                }).catch(err => {
                    this.isSaving = false;
                    this.error = err;
                });
            }
        });
    }

    addField(fieldType) {
        let fieldName = `${fieldType}_fields`;
        if (!this.item[fieldName]) {
            this.item[fieldName] = [];
        }
        let field = {};
        this.item[fieldName].push(field);
        this.validator.addObject(field, this.validationRuleset[fieldName]);
        if (fieldType == 'calculation') {
            this.calculations.push(field);
        }
    }

    removeField(index, fieldType, item) {
        if (item.id) {
            item.field_type = fieldType;
            this.removedFields.push(item);
        }
        let fieldName = `${fieldType}_fields`;
        this.item[fieldName].splice(index, 1);
    }

    clearObject(obj) {
        // Just replace the whole thing :P
        this.item = {};
        this.applyValidation();
    }

    cancel() {
        this.clearObject()
        super.cancel()
    }
}
