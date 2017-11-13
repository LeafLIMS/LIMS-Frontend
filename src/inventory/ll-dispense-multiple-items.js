import { inject, bindable, bindingMode, NewInstance } from 'aurelia-framework';
import { InventoryApi } from '../inventory/api';
import { EventAggregator } from 'aurelia-event-aggregator';
import { ValidationRules, ValidationController, validateTrigger } from 'aurelia-validation';
import { UiValidationRenderer } from '../components/semantic-ui/ui-validation-renderer';

@inject(InventoryApi, EventAggregator, NewInstance.of(ValidationController))
export class LlDispenseMultipleItems {
    @bindable({ defaultBindingMode: bindingMode.twoWay }) toggle;
    @bindable searchText;

    constructor(inventoryApi, eventAggregator, validationController) {
        this.api = inventoryApi;
        this.ea = eventAggregator;
        this.validator = validationController;
        this.validator.validateTrigger = validateTrigger.changeOrBlur;
        this.validator.addRenderer(new UiValidationRenderer());

        this.items = {};
        this.dispense = [];

        this.rules = ValidationRules
            .ensure('dispense_amount').required()
            .matches(/[0-9.]/)
            .ensure('destination_coordinates')
            .satisfies((value, obj) => {
                if (value) {
                    for (let o of this.dispense) {
                        if (o.randomString !== obj.randomString) {
                            // Look for duplicate barcode/coordinates
                            if ((o.destination_barcode && o.destination_coordinates &&
                                obj.destination_barcode && obj.destination_coordinates) &&
                                (o.destination_barcode === obj.destination_barcode &&
                                o.destination_coordinates === obj.destination_coordinates)) {
                                return false;
                            }
                        }
                    }
                }
                return true;
            }).rules;
    }

    searchTextChanged(n) {
        this.api.inventory({search: n}).then(data => {
            this.items = data;
        }).catch(err => this.error = err);
    }

    addItem(item) {
        let newItem = Object.assign({}, item);
        // Match for validation later e.g. if three of same item being dispensed
        let randomEnough = Math.random().toString(36).slice(2);
        newItem.randomString = randomEnough;
        this.validator.addObject(newItem, this.rules);
        this.dispense.push(newItem);
    }

    removeItem(index) {
        this.validator.removeObject(this.dispense[index]);
        this.dispense.splice(index, 1);
    }

    save() {
        this.validator.validate().then(results => {
            console.log(results);
            if (results.valid) {
                let promises = [];
                for (let obj of this.dispense) {
                    let transfer = {
                        amount: obj.dispense_amount,
                        barcode: obj.destination_barcode,
                        coordinates: obj.destination_coordinates,
                    }
                    promises.push(this.api.createTransfer(obj.id, transfer));
                }
                Promise.all(promises).then(response => {
                    this.ea.publish('transfersUpdated', {source: 'dispense-multiple'});
                    this.cancel();
                })
                .catch(err => {
                    this.error = err;
                });
            }
        });
    }

    cancel() {
        this.dispense = [];
        this.error = null;
        this.toggle = false;
    }
}
