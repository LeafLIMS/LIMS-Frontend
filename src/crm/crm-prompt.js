import { inject } from 'aurelia-framework';
import { CrmApi } from './api';
import { DialogController } from 'aurelia-dialog';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(Element, CrmApi, DialogController, EventAggregator)
export class CrmPrompt {

    constructor(element, crmApi, dialogController, eventAggregator) {
        this.dialog = dialogController;
        this.api = crmApi;
        this.ea = eventAggregator;

        this.result = null;
        this.crmItems = {results: []};

        this.query = {
            limit: 200,
            search: ''
        }
    }

    attached() {
        this.querySubscriber = this.ea.subscribe('searchQueryChanged', response => {
            this.getItems();
        });
    }

    detached() {
        this.querySubscriber.dispose();
    }

    getItems() {
        console.log(this.query);
        this.api.crmProjects(this.query).then(data => {
            this.crmItems = data;
        });
    }
}
