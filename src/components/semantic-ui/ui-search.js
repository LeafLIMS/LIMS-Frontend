import { inject, bindable, bindingMode } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(Element, EventAggregator)
export class UiSearchCustomElement {
    @bindable({ defaultBindingMode: bindingMode.twoWay }) search;
    @bindable({ defaultBindingMode: bindingMode.twoWay }) source;
    @bindable model;

    constructor(element, eventAggregator) {
        this.element = element;
        this.ea = eventAggregator;

        this.searchHandler = query => {
            this.search = query;
            this.ea.publish('searchQueryChanged', {source: 'search'});
            this.field.search('add results',
                this.field.search('generate results', this.source)
            );
        }
    }

    attached() {
        this.field = jQuery('.ui.search', this.element);
        this.field.search({
            source: this.source,
            fields: {
                results: 'results',
                title: this.model[0],
            },
            searchFields: this.model,
            onSearchQuery: this.searchHandler
        });
    }
}
