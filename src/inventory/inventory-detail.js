import { inject, NewInstance, BindingEngine } from 'aurelia-framework';
import { InventoryApi } from './api';
import { SharedApi } from '../shared/api';
import { EventAggregator } from 'aurelia-event-aggregator';
import { ValidationRules, ValidationController, validateTrigger } from 'aurelia-validation';
import { UiValidationRenderer } from '../components/semantic-ui/ui-validation-renderer';
import { Router } from 'aurelia-router';

@inject(InventoryApi, EventAggregator, SharedApi, NewInstance.of(ValidationController),
        BindingEngine, Router)
export class InventoryDetail {

    constructor(inventoryApi, eventAggregator, sharedApi, validationController, bindingEngine,
                router) {
        this.api = inventoryApi;
        this.ea = eventAggregator;
        this.sharedApi = sharedApi;
        this.bindingEngine = bindingEngine;
        this.router = router;

        this.validator = validationController;
        this.validator.validateTrigger = validateTrigger.changeOrBlur;
        this.validator.addRenderer(new UiValidationRenderer());

        this.item = {};

        ValidationRules
            .ensure('name').required()
            .ensure('item_type').required()
            .ensure('location').required()
            .ensure('amount_available').matches(/[0-9\.]/).required()
            .ensure('amount_measure').required()
            .on(this.item);

        this.observe = [
            'name',
            'item_type',
            'location',
            'barcode',
            'identifier',
            'amount_measure',
            'concentration',
            'concentration_measure',
        ];
        this.subscribers = [];

        this.updateItem = (n, o) => {
            if (n != o) {
                this.api.updateItem(this.item.id, this.item).then(data => {
                    this.item = data;
                    this.subscribe();
                }).catch(err => {
                    this.error = err;
                });
            }
        };

        this.updateProperty = (n, o) => {
            // check all properties have key + value before send
            for (let p of this.item.properties) {
                if (p.name != '' && p.value != '') {
                    this.updateItem(n, o);
                }
            }
        };

        this.updateProperties = splices => {
            if (splices[0].removed.length > 0) {
                this.updateItem();
            } else {
                this.observePropertyEntry(this.item.properties[splices[0].index]);
            }
        };

        this.api.itemTypes().then(data => {
            this.itemTypes = data;
        });

        this.sharedApi.measures().then(data => {
            this.measures = data;
        });

        this.sharedApi.locations().then(data => {
            this.locations = data;
        });
    }

    activate(params, routeMap) {
        this.params = params;
        this.routeMap = routeMap;

        this.getItem();
    }

    attached() {
        this.updateSubscriber = this.ea.subscribe('inventoryItemUpdated', response => {
            this.getItem();
        });
    }

    detached() {
        this.updateSubscriber.dispose();
        for (let s of this.subscribers) {
            s.dispose();
        }
    }

    subscribe() {
        // When an update is called the references change to the item
        // To allow subscribers to continue to work unsubscribe all from old item
        // and set a bunch of new ones up on the new item.
        for (let s of this.subscribers) {
            s.dispose();
        }
        for (let o of this.observe) {
            this.subscribers.push(this.bindingEngine.propertyObserver(this.item, o)
                                  .subscribe(this.updateItem));
        }
        // Need a different approach for listening for changes in properties array
        this.subscribers.push(this.bindingEngine.collectionObserver(this.item.properties)
                              .subscribe(this.updateProperties));
        // Each property needs to have it's own observer as well for the key + value
        for (let p of this.item.properties) {
            this.observePropertyEntry(p);
        }
    }

    observePropertyEntry(property) {
        this.subscribers.push(this.bindingEngine.propertyObserver(property, 'name')
                              .subscribe(this.updateProperty));
        this.subscribers.push(this.bindingEngine.propertyObserver(property, 'value')
                              .subscribe(this.updateProperty));
    }

    getItem() {
        this.api.inventoryDetail(this.params.id).then(data => {
            this.item = data;
            this.routeMap.navModel.title = this.item.name;

            if (this.subscribers.length == 0) {
                this.subscribe();
            }
        }).catch(err => {
            if (err.status == 404) {
                this.router.navigateToRoute('itemNotFound');
            } else {
                this.error = err;
            }
            console.log(err);
        });
    }

    addProperty() {
        this.item.properties.push({name: '', value: ''});
    }

    removeProperty(index) {
        this.item.properties.splice(index, 1);
    }
}
