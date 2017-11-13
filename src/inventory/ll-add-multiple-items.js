import { inject, bindable, bindingMode, NewInstance } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { InventoryApi } from './api';
import { FiletemplateApi } from '../filetemplates/api';
import { EventAggregator } from 'aurelia-event-aggregator';
import { ValidationRules, ValidationController, validateTrigger } from 'aurelia-validation';
import { UiValidationRenderer } from '../components/semantic-ui/ui-validation-renderer';

@inject(InventoryApi, FiletemplateApi,
        EventAggregator, NewInstance.of(ValidationController), Router)
export class LlAddMultipleItems {
    @bindable({ defaultBindingMode: bindingMode.twoWay }) toggle;

    constructor(inventoryApi, filetemplateApi, eventAggregator, validationController, router) {
        this.api = inventoryApi;
        this.filetemplateApi = filetemplateApi;
        this.ea = eventAggregator;
        this.router = router;

        this.options = {};
        this.fields = '';
        this.rejected = [];
        this.hasRejected = false;
        this.isLoading = false;

        this.validator = validationController;
        this.validator.validateTrigger = validateTrigger.changeOrBlur;
        this.validator.addRenderer(new UiValidationRenderer());


        ValidationRules
            .ensure('file_template').required()
            .ensure('items_file').required()
            .on(this.options);

        this.filetemplateApi.filetemplates().then(data => {
            this.fileTemplates = data;
        });
    }

    setFields(event) {
        this.fields = '';
        let fileTemplate = this.fileTemplates.results.find(elem => {
            return elem.id = event.target.value;
        });
        for (let field of fileTemplate.fields) {
            this.fields += field.name+', ';
        }
        this.fields.trim(', ');
    }

    save() {
        this.validator.validate().then(results => {
            if (results.valid) {
				var params = new FormData();
				params.append('items_file', this.options.items_file[0]);
				params.append('filetemplate', this.options.file_template);
				params.append('permissions', JSON.stringify(this.options.assign_groups));
                this.isLoading = true;
                this.api.createMultipleItems(params).then(data => {
                    this.isLoading = false;
                    data.json().then(response => {
                        data.body = response;
                        if (response.rejected.length > 0) {
                            this.hasRejected = true;
                            this.rejected = response.rejected;
                        } else {
                            this.cancel();
                        }
                        this.ea.publish('queryChanged', {source: 'importInventory'});
                    }).catch(err => {
                        this.isLoading = false;
                        this.error = data;
                    });
                }).catch(err => {
                    this.error = err;
                });
            }
        });
    }

    cancel() {
        this.options = {};
        this.fields = '';
        this.rejected = [];
        this.hasRejected = false;
        this.toggle = false;
    }
}
