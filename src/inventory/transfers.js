import { inject } from 'aurelia-framework';
import { InventoryApi } from './api';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(InventoryApi, EventAggregator)
export class Transfers {

    constructor(inventoryApi, eventAggregator) {
        this.api = inventoryApi;
        this.ea = eventAggregator;

        this.query = {
            limit: 10,
        }

        this.getTransfers();
    }

    attached() {
        this.querySubscriber = this.ea.subscribe('queryChanged', response => {
            if (response.source == 'pagination') {
                this.query.page = response.page;
                this.query.limit = response.limit;
            }
            this.getTransfers();
        });
    }

    detached() {
        this.querySubscriber.dispose();
    }

    getTransfers() {
        this.api.transfers(this.query).then(data => {
            this.transfers = data;
        });
    }

}
