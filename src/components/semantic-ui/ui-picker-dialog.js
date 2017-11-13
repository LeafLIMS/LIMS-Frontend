import { bindable, inject, bindingMode } from 'aurelia-framework';
import { DialogController } from 'aurelia-dialog';
import { Config } from 'aurelia-api';

@inject(Element, DialogController, Config)
export class UiPickerDialog {
    @bindable searchTerm;

    constructor(element, dialogController, config) {
        this.endpoint = config.getEndpoint('api');
        this.dialog = dialogController;
        this.selected = [];
        this.matcher = (a, b) => a.id === b.id;
    }

    activate(pickerConfig) {
        this.config = pickerConfig;
        this.searchTermChanged();
    }

    searchTermChanged(n, o) {
        this.search(this.searchTerm).then(results => {
            this.searchResults = results;
        });
    }

    search(term) {
        let searchLocation = this.config.lookup + '/';
        let params = {search: term, limit: 10};
        return this.endpoint.find(searchLocation, params);
    }

}
