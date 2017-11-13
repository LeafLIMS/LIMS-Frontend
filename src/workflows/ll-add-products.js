import { inject, bindable, bindingMode, NewInstance } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { WorkflowApi } from './api';

@inject(WorkflowApi, EventAggregator)
export class LlAddProducts {
    @bindable({ defaultBindingMode: bindingMode.twoWay }) toggle;
    @bindable source;

    constructor(workflowApi, eventAggregator) {
        this.api = workflowApi;
        this.ea = eventAggregator;

        this.selected = [];
        this.config = {};
    }

    sourceChanged() {
        this.config = {
            lookup: 'products',
            exclude: this.source.products,
            displayName: 'product_identifier',
            displayOther: ['name']
        }
    }

    save() {
        if (this.selected.length > 0) {
            var products = this.source.products;
            products = products.concat(this.selected.map(x => x.id));
            this.api.updateRun(this.source.id, {products: products}).then(data => {
                this.ea.publish('runUpdated', {source: 'addProductsToRun'});
                this.cancel();
            }).catch(err => {
                this.error = err;
            });
        }
    }

    cancel() {
        this.selected = [];
        this.toggle = false;
    }
}
