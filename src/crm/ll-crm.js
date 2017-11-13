import { inject, bindable, bindingMode } from 'aurelia-framework';
import { CrmApi } from './api';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(CrmApi, EventAggregator)
export class LlCrm {
    @bindable({ defaultBindingMode: bindingMode.twoWay }) source;

    constructor(crmApi, eventAggregator) {
        this.api = crmApi;
        this.ea = eventAggregator;
        this.query = {
            limit: 50
        }
    }

    getItems() {
        this.fetching = true;
        this.api.crmProjects(this.query).then(data => {
            this.items = data;
            this.fetching = false;
        });
    }

    cancel() {
        this.add = false;
        this.change = false;
    }

    choose(item) {
        this.api.associateCRMProject(this.source.id, item.Id).then(data => {
            this.ea.publish('projectUpdated', {source: 'crm', id: this.source.id});
            this.add = false;
            this.change = false;
        }).catch(err => {
            this.error = err;
        });
    }

    remove() {
        // TODO: Implement remove behaviour
        console.log('NOT IMPLEMENTED');
    }

}
