import { inject, bindable, bindingMode } from 'aurelia-framework';
import { InventoryApi } from '../../inventory/api';

@inject(Element, InventoryApi)
export class LlInputFieldCustomElement {
    @bindable field;
    @bindable calculations;
    @bindable({defaultBindingMode: bindingMode.twoWay}) outputTo;

    constructor(element, inventoryApi) {
        this.element = element;
        this.api = inventoryApi;

        this.doQuery = (settings, callback) => {
            let params = {
                search: settings.urlData.query,
                item_type__name: this.field.lookup_type,
            }
            this.api.inventory(params).then(data => {
                callback(data);
            });
        }

        this.updateFromDropdown = (value, text, choice) => {
            this.outputTo[this.field.store_value_in] = value;
        }
    }

    outputToChanged() {
        if (Object.keys(this.outputTo).length === 0 && this.field) {
            this.outputTo.label = this.field.label;
            this.outputTo.amount = this.field.amount;
            this.outputTo.measure = this.field.measure;
            this.outputTo.from_calculation = this.field.from_calculation;
            this.outputTo.from_input_file = this.field.from_input_file;
        }
    }

    attached() {
        $('.search.selection.dropdown', this.element).dropdown({
            apiSettings: {
                responseAsync: this.doQuery,
            },
            fields: {
                remoteValues: 'results',
                name: 'name',
                value: 'id',
            },
            onChange: this.updateFromDropdown
        });
    }
}
