import { inject, bindable, bindingMode } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(Element, EventAggregator)
export class UiTableSortCustomElement {
    @bindable({defaultBindMode: bindingMode.twoWay}) query;
    @bindable sort;

    constructor(element, eventAggregator) {
        this.element = element;
        this.ea = eventAggregator;
        this.previousElement = null;
        this.handler = event => {
            let col = event.target;
            let sortBy = col.getAttribute('sort-by');
            if (sortBy) {
                if(this.previousElement) {
                    this.previousElement.classList.remove('ascending');
                    this.previousElement.classList.remove('descending');
                    this.previousElement.classList.remove('sorted');
                }
                if ('ordering' in this.query && this.query.ordering.endsWith(sortBy)) {
                    if (this.query.ordering.startsWith('-')) {
                        this.query.ordering = sortBy;
                        col.classList.add('ascending');
                        col.classList.add('sorted');
                    } else {
                        this.query.ordering = '-' + sortBy;
                        col.classList.add('descending');
                        col.classList.add('sorted');
                    }
                } else {
                    this.query.ordering = sortBy;
                    col.classList.add('ascending');
                    col.classList.add('sorted');
                }
                this.previousElement = col;
                this.ea.publish('queryChanged', {source: 'sort'});
            }
        }
    }

    attached() {
        this.element.addEventListener('click', this.handler);
    }

    detached() {
        this.element.removeEventListener('click', this.handler);
    }
}
