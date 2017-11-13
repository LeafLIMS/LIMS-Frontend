import { inject, bindable, bindingMode, NewInstance } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { InventoryApi } from './api';
import { SharedApi } from '../shared/api';
import { EventAggregator } from 'aurelia-event-aggregator';
import { ValidationRules, ValidationController, validateTrigger } from 'aurelia-validation';
import { UiValidationRenderer } from '../components/semantic-ui/ui-validation-renderer';

@inject(InventoryApi, SharedApi, EventAggregator, NewInstance.of(ValidationController), Router)
export class LlAddItem {
    @bindable({ defaultBindingMode: bindingMode.twoWay }) toggle;

    constructor(inventoryApi, sharedApi, eventAggregator, validationController, router) {
        this.api = inventoryApi;
        this.sharedApi = sharedApi;
        this.ea = eventAggregator;
        this.router = router;

        this.validator = validationController;
        this.validator.validateTrigger = validateTrigger.changeOrBlur;
        this.validator.addRenderer(new UiValidationRenderer());

        this.item = {
            properties: [],
        };

        this.api.itemTypes().then(data => {
            this.types = data;
        });

        this.sharedApi.measures().then(data => {
            this.measures = data;
        });

        this.sharedApi.locations().then(data => {
            this.locations = data;
        });

        ValidationRules
            .ensure('name').required()
            .ensure('item_type').required()
            .ensure('location').required()
            .ensure('amount_available').matches(/[0-9\.]/).required()
            .ensure('amount_measure').required()
            .on(this.item);
    }

    addProperty() {
        this.item.properties.push({name: '', value: ''});
    }

    removeProperty(index) {
        this.item.properties.splice(index, 1);
    }

    save() {
        this.validator.validate().then(results => {
            console.log(results);
            if (results.valid) {
                this.api.createItem(this.item).then(data => {
                    this.router.navigateToRoute('inventoryDetail', {id: data.id});
                })
                .catch(err => {
                    this.error = err;
                });
            }
        });
    }

    cancel() {
        this.item = {};
        this.toggle = false;
    }
}
