import { inject } from 'aurelia-framework';
import { AlertApi } from '../../alerts/api';
import { UserApi } from '../../auth/api';
import { SettingsTable } from '../settings-table';
import { ValidationRules } from 'aurelia-validation';

@inject(AlertApi, UserApi)
export class Alert extends SettingsTable {

    constructor(alertApi, userApi, ...rest) {
        super(...rest);

        this.api = alertApi;
        this.userApi = userApi;

        this.setFunctions('triggerSet');
        this.createTemplate = './alerts/create-alert.html';

        this.removed = [];

        this.tableHeaders = [
            'Name',
            'Severity',
            'For',
        ];
        this.tableFields = [
            'name',
            'severity',
            'model',
        ];

        this.models = [
            {model: 'Item', endpoint: 'inventory'},
            {model: 'Set', endpoint: 'inventorysets'},
            {model: 'Project', endpoint: 'projects'},
            {model: 'Product', endpoint: 'products'},
            {model: 'Run', endpoint: 'runs'},
            {model: 'Equipment', endpoint: 'equipment'},
            {model: 'Task', endpoint: 'tasks'},
            {model: 'Workflow', endpoint: 'workflows'},
            {model: 'EquipmentReservation', endpoint: 'equipmentreservation'},
        ];

        this.operators = [
            {value: '<', name: 'less than'},
            {value: '<=', name: 'less than or equal to'},
            {value: '==', name: 'equal to'},
            {value: '>=', name: 'greater than or equal to'},
            {value: '>', name: 'greater than'},
            {value: '!=', name: 'not equal to'},
        ];

        this.triggerValidation = ValidationRules
                                    .ensure('field').required()
                                    .when(x => !x.fire_on_create)
                                    .ensure('operator').required()
                                    .when(x => !x.fire_on_create)
                                    .ensure('value').required()
                                    .when(x => !x.fire_on_create)
                                    .rules;

        this.subscriptionValidation = ValidationRules
                                        .ensure('user').required()
                                        .rules;


        this.applyValidation();

    }

    applyValidation() {
        ValidationRules
            .ensure('name').required()
            .ensure('severity').required()
            .ensure('model').required()
            .on(this.item);
    }

    addTrigger() {
        if (!this.item.triggers) {
            this.item.triggers = [];
        }
        let trigger = {};
        this.validator.addObject(trigger, this.triggerValidation);
        this.item.triggers.push(trigger);
    }

    removeTrigger(index, item) {
        this.removed.push(item);
        this.item.triggers.splice(index, 1);
    }

    addSubscription() {
        if (!this.item.subscriptions) {
            this.item.subscriptions = [];
        }
        let subscription = {};
        this.validator.addObject(subscription, this.susbscriptionValidation);
        this.item.subscriptions.push(subscription);
    }

    removeSubscription(index, item) {
        this.removed.push(item);
        this.item.subscriptions.splice(index, 1);
    }

    setAvailableFields(event) {
        let model = this.models.find(x => x.model === event.target.value);
        this.api.modelFields(model.endpoint).then(data => {
            let fieldsList = Object.entries(data.actions.POST);
            this.fields = new Map(fieldsList);
        }).catch(err => console.log(error));
    }

    edit(item) {
        let fakeEvent = {target: {value: item.model}};
        this.setAvailableFields(fakeEvent);
        super.edit(item);
    }

    createOrUpdate(id) {
        let actions = [];
        for (let x of this.item.triggers) {
            if (x.id) {
                actions.push(this.api.updateTrigger(x.id, x));
            } else {
                x.triggerset_id = id;
                actions.push(this.api.createTrigger(x));
            }
        }
        for (let x of this.item.subscriptions) {
            if (x.id) {
                actions.push(this.api.updateSubscription(x.id, x));
            } else {
                x.triggerset_id = id;
                actions.push(this.api.createSubscription(x));
            }
        }
        return actions;
    }

    removeItems(actions) {
        for (let r of this.removed) {
            if (r.id) {
                if (r.field) {
                    actions.push(this.api.deleteTrigger(r.id));
                } else {
                    actions.push(this.api.deleteSubscription(r.id));
                }
            }
        }
        this.removed = [];
        return actions;
    }

    save() {
        this.validator.validate().then(results => {
            if (results.valid) {
                this.api[this.saveFunc](this.item).then(data => {
                    let actions = this.createOrUpdate(data.id);
                    Promise.all(actions).then(response => {
                        this.getData();
                        this.cancel();
                    }).catch(err => this.error = err);
                }).catch(err => {
                    this.error = err;
                });
            }
        });
    }

    update() {
        this.validator.validate().then(results => {
            if (results.valid) {
                this.api[this.updateFunc](this.item.id, this.item).then(data => {
                    let actions = this.createOrUpdate(data.id);
                    this.removeItems(actions);
                    Promise.all(actions).then(response => {
                        this.getData();
                        this.cancel();
                    }).catch(err => this.error = err);
                }).catch(err => {
                    this.error = err;
                });
            }
        });
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
