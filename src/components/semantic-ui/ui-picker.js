import { bindable, inject, bindingMode } from 'aurelia-framework';
import { Config } from 'aurelia-api';

@inject(Element, Config)
export class UiPicker {
    @bindable config;
    @bindable({defaultBindingMode: bindingMode.twoWay}) selected;
    @bindable searchTerm;
    @bindable matcher = (a, b) => a.id === b.id;

    constructor(element, config) {
        this.endpoint = config.getEndpoint('api');
        if (!this.selected) {
            this.selected = [];
        }
        //this.matcher = (a, b) => a.id === b.id;
    }

    configChanged(n, o) {
        this.config = n;
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
        if (this.config.exclude) {
            let excludeString = this.config.exclude.join(',');
            params.exclude = excludeString;
        }
        return this.endpoint.find(searchLocation, params);
    }

}
