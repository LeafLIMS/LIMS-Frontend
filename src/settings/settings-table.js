import { inject, NewInstance } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { DialogService } from 'aurelia-dialog';
import { Prompt } from '../components/semantic-ui/ui-prompt';
import { ValidationRules, ValidationController, validateTrigger } from 'aurelia-validation';
import { UiValidationRenderer } from '../components/semantic-ui/ui-validation-renderer';

@inject(EventAggregator, NewInstance.of(ValidationController), DialogService)
export class SettingsTable {

    constructor(eventAggregator, validationController, dialogService) {
        this.ea = eventAggregator;
        this.dialog = dialogService;

        this.validator = validationController;
        this.validator.validateTrigger = validateTrigger.changeOrBlur;
        this.validator.addRenderer(new UiValidationRenderer());

        this.item = {};
        this.selected = [];
        this.query = {
            limit: 10,
        }
        this.isLoading = true;
        this.isSaving = false;

        this.createItem = false;
        this.updateItem = false;

        this.setFunctions('');

        this.tableHeaders = [];
        this.tableFields = [];
    }

    activate(params, routerConfig) {
        console.log("ST", params, routerConfig);
    }

    setFunctions(objName) {
        this.objName = objName;
        this.getFunc = this.objName + 's';
        this.updateFunc = 'update' + this.upperFirst(this.objName);
        this.saveFunc = 'create' + this.upperFirst(this.objName);
        this.deleteFunc = 'delete' + this.upperFirst(this.objName);
    }

    activate(model) {
        this.data = model;
        this.getData();
    }

    getData() {
        this.api[this.getFunc](this.query).then(data => {
            this.table = data;
            this.isLoading = false;
        }).catch(err => {
            this.tableError = err;
        });
    }

    deleteItem(id) {
        return this.api[this.deleteFunc](id);
    }

    save() {
        this.validator.validate().then(results => {
            console.log(results);
            if (results.valid) {
                this.api[this.saveFunc](this.item).then(data => {
                    this.getData();
                    this.cancel();
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
                    this.getData();
                    this.cancel();
                }).catch(err => {
                    this.error = err;
                });
            }
        });
    }

    create() {
        this.createItem = true;
        this.taskList = [];
    }

    edit(item) {
        this.createItem = true;
        this.updateItem = true;
        Object.assign(this.item, item);
    }

    attached() {
        this.querySubscriber = this.ea.subscribe('queryChanged', response => {
            if (response.source == 'pagination') {
                this.query.page = response.page;
                this.query.limit = response.limit;
            }
            this.getData();
        });
    }

    detached() {
        this.querySubscriber.dispose();
    }

    deleteItems() {
        let message = 'Delete ' + this.selected.length + ' items?';
        this.dialog.open({viewModel: Prompt, model: message}).whenClosed(response => {
            if (!response.wasCancelled) {
                let promises = []
                for (let item of this.selected) {
                    console.log(item);
                    promises.push(this.deleteItem(item.id));
                }
                Promise.all(promises).then(response => {
                    this.getData();
                    this.selected.splice(0, this.selected.length);
                }).catch(err => {
                    this.tableError = err;
                });
            }
        });
    }

    upperFirst(str) {
        return str.charAt(0).toUpperCase() + str.substr(1);
    }

    clearObject(obj) {
        Object.keys(obj).forEach(function(key) { delete obj[key]; });
    }

    cancel() {
        this.clearObject(this.item);
        this.createItem = false;
        this.updateItem = false;
        this.error = undefined;
    }

}
