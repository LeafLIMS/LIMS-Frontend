import { inject, bindable, bindingMode, NewInstance } from 'aurelia-framework';
import { ProjectApi } from './api';
import { EventAggregator } from 'aurelia-event-aggregator';
import { ValidationRules, ValidationController, validateTrigger } from 'aurelia-validation';
import { UiValidationRenderer } from '../components/semantic-ui/ui-validation-renderer';

@inject(ProjectApi, EventAggregator, NewInstance.of(ValidationController))
export class LlImportProducts {
    @bindable source;
    @bindable({ defaultBindingMode: bindingMode.twoWay }) toggle;

    constructor(projectApi, eventAggregator, validationController) {
        this.api = projectApi;
        this.ea = eventAggregator;

        this.validator = validationController;
        this.validator.validateTrigger = validateTrigger.changeOrBlur;
        this.validator.addRenderer(new UiValidationRenderer());

        this.isLoading = false;
        this.products = {};
        this.rejected = [];

        ValidationRules
            .ensure('products').required()
    }

    save() {
        this.validator.validate().then(results => {
            let formData = new FormData();
            formData.append('products_file', this.products.products[0]);
            if (this.products.items) {
                for (let [key, fileItem] of this.products.items) {
                    formData.append(key, fileItem[0]);
                }
            }
            this.isLoading = true;
            this.api.importProducts(this.source.id, formData).then(data => {
                this.isLoading = false;
                data.json().then(response => {
                    data.body = response;
                    if (response.rejected.length > 0) {
                        this.hasRejected = true;
                        this.rejected = response.rejected;
                    } else {
                        this.cancel();
                    }
                    this.ea.publish('queryChanged', {source: 'importProducts'});
                }).catch(err => {
                    this.isLoading = false;
                    this.error = data;
                });
            }).catch(err => {
                this.isLoading = false;
                this.error = err;
            });
        });
    }

    cancel() {
        this.products = {};
        this.rejected = [];
        this.error = false;
        this.hasRejected = false;
        this.toggle = false;
    }
}
