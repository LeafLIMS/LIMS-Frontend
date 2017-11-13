import { inject, NewInstance } from 'aurelia-framework';
import { InventoryApi } from './api';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(InventoryApi, EventAggregator)
export class TransferDetail {

    constructor(inventoryApi, eventAggregator) {
        this.api = inventoryApi;
        this.ea = eventAggregator;
    }

    activate(params, routeMap) {

        this.params = params;
        this.routeMap = routeMap;

        this.routeMap.navModel.title = params.barcode;
        this.barcode = params.barcode;

        this.api.transfers({barcode: params.barcode}).then(data => {
            this.transfers = data;
        });
    }

}
