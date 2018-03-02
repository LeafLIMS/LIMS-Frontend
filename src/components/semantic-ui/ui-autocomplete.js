import { inject, bindable, bindingMode } from 'aurelia-framework';
import { Config } from 'aurelia-api';

@inject(Element, Config)
export class UiAutocomplete {
    @bindable({defaultBindingMode: bindingMode.twoWay}) value;
    @bindable from;
    @bindable placeholder;
    @bindable searchParams = {};
    @bindable displayValue = 'name';
    @bindable storeValue = 'id';
    @bindable defaultText = '';
    @bindable multiple = false;
    @bindable autofill = false;

    constructor(element, config) {
        this.element = element;
        this.endpoint = config.getEndpoint('api');

        this.doQuery = (settings, callback) => {
            let path = `${this.from}/`;
            let params = this.searchParams;
            params.search = settings.urlData.query;
            this.endpoint.find(path, params).then(data => {
                callback(data);
            });
        }

        this.updateFromDropdown = (value, text, choice) => {
            this.value = value;
        }

        this.doAutoFill = () => {
            let path = `${this.from}/`;
            this.endpoint.find(path, this.searchParams).then(data => {
                if (data.results.length == 1) {
                    this.dropdown.dropdown('set text', data.results[0][this.displayValue]);
                    this.value = data.results[0][this.storeValue];
                }
            });
        }
    }

    defaultTextChanged(value) {
        if (this.dropdown) {
            this.dropdown.dropdown('set text', this.defaultText);
        }
    }

    searchParamsChanged(value) {
        if (this.autofill) {
            this.doAutoFill();
        }
    }

    attached() {
        setTimeout(() => {
            this.dropdown = $('.search.selection.dropdown', this.element).dropdown({
                apiSettings: {
                    responseAsync: this.doQuery,
                },
                fields: {
                    remoteValues: 'results',
                    name: this.displayValue,
                    value: this.storeValue,
                },
                onChange: this.updateFromDropdown,
                localSearch: false,
            });
            this.dropdown.dropdown('set text', this.defaultText);
        }, 1);
    }
}
