import { inject, bindable, bindingMode, NewInstance } from 'aurelia-framework';
import { ProjectApi } from './api';
import { InventoryApi } from '../inventory/api';
import { EventAggregator } from 'aurelia-event-aggregator';
import { ValidationRules, ValidationController, validateTrigger } from 'aurelia-validation';
import { UiValidationRenderer } from '../components/semantic-ui/ui-validation-renderer';

@inject(ProjectApi, InventoryApi, EventAggregator, NewInstance.of(ValidationController))
export class LlNewProduct {
    @bindable source;
    @bindable({ defaultBindingMode: bindingMode.twoWay }) toggle;

    constructor(projectApi, inventoryApi, eventAggregator, validationController) {
        this.api = projectApi;
        this.inventoryApi = inventoryApi;
        this.ea = eventAggregator;

        this.validator = validationController;
        this.validator.validateTrigger = validateTrigger.changeOrBlur;
        this.validator.addRenderer(new UiValidationRenderer());

        this.product = {};

        this.validationRules = ValidationRules
            .ensure('name').required()
            .ensure('status').required()
            .ensure('product_type').required()

        this.validationRules
            .on(this.product);

        this.api.productStatuses().then(data => {
            this.statuses = data;
        });

        this.inventoryApi.itemTypes().then(data => {
            this.productTypes = data;
        });
    }

    save() {
        this.validator.validate().then(results => {
            if (results.valid) {
                this.api.saveProduct(this.source.id, this.product).then(data => {
                    this.cancel();
                    this.ea.publish('productAdded', {source: 'newProduct'});
                }).catch(err => {
                    this.error = err;
                });
            }
        });
    }

    cancel() {
        this.toggle = false;
        this.product = {};
        this.validationRules
            .on(this.product);
        this.error = undefined;
    }
}
