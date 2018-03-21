import { inject, NewInstance } from 'aurelia-framework';
import { InventoryApi } from './api';
import { EventAggregator } from 'aurelia-event-aggregator';
import { Router } from 'aurelia-router';
import { DialogService } from 'aurelia-dialog';
import { Prompt } from '../components/semantic-ui/ui-prompt';

@inject(InventoryApi, EventAggregator, Router, DialogService)
export class Inventory {

    constructor(inventoryApi, eventAggregator, router, dialogService) {
        this.api = inventoryApi;
        this.ea = eventAggregator;
        this.router = router;
        this.dialog = dialogService;

        this.selected = [];

        this.addItem = false;
        this.addMultipleItems = false;
        this.dispenseMultipleItems = false;

        this.tempMessage = false;

        this.searchOptions = {
            useAdvanced: true,
            fields: [
                { name: 'id', display: 'Id', op: ['exact']},
                { name: 'name', display: 'Name', op:  ['exact', 'icontains']},
                { name: 'added_by__username', display: 'Added by', op: ['exact']},
                { name: 'identifier', display: 'Identifier', op: ['exact']},
                { name: 'barcode', display: 'Barcode', op: ['exact']},
                { name: 'description', display: 'Description', op: ['icontains']},
                { name: 'item_type__name', display: 'Item type', op: ['exact']},
                { name: 'location__name', display: 'Location', op: ['exact']},
                { name: 'in_inventory', display: 'Available', op: ['exact']},
                { name: 'amount_measure__symbol', display: 'Measure', op: ['exact']},
                { name: 'amount_available', display: 'Amount',
                  op: ['exact', 'lt', 'lte', 'gt', 'gte']},
                { name: 'concentration_measure__symbol', display: 'Concentration measure',
                  op: ['exact']},
                { name: 'concentration', display: 'Concentration',
                  op: ['exact', 'lt', 'lte', 'gt', 'gte']},
                { name: 'added_on', display: 'Added on', op: ['exact', 'lt', 'lte', 'gt', 'gte']},
                { name: 'last_updated_on', display: 'Last updated',
                  op: ['exact', 'lt', 'lte', 'gt', 'gte']},
                { name: 'properties__name', display: 'Property name', op: ['exact', 'icontains']},
                { name: 'properties__value', display: 'Property value',
                  op: ['exact', 'icontains']},
            ]
        };

        this.query = {
            limit: 10,
            in_inventory: 'True',
        }

        this.transfer_query = {
            limit: 200,
            ordering: 'barcode'
        }

        this.exportItems = false;

        this.isLoading = true;
        this.isLoadingTransfers = true;

        this.getInventory();
        this.getTransfers();
    }

    attached() {
        this.querySubscriber = this.ea.subscribe('queryChanged', response => {
            if (response.source == 'pagination') {
                this.query.page = response.page;
                this.query.limit = response.limit;
            }
            if (response.source == 'search') {
                this.query.search = response.value;
            }
            if (response.source == 'importInventory') {
                this.tempMessage = true;
                this.tempMessageColour = 'positive';
                this.tempMessageTitle = 'Import successful';
                this.tempMessageText = `${response.saved.length} items where added.`;
            }
            this.getInventory();
        });

        this.transferSubscriber = this.ea.subscribe('transfersUpdated', response => {
            this.getTransfers();
        });
    }

    detached() {
        this.querySubscriber.dispose();
        this.transferSubscriber.dispose();
    }

    getInventory() {
        this.api.inventory(this.query).then(data => {
            this.inventory = data;
            this.query.page = 1;
            this.isLoading = false;
        });
    }

    getTransfers() {
        this.api.groupedTransfers(this.transfer_query).then(data => {
            this.transfers = new Map(Object.entries(data));
            this.isLoadingTransfers = false;
        });
    }

    groupBy = function(n, key) {
        return n.reduce((o, x) => {
            if (!o.has(x[key])) {
                o.set(x[key], []);
            }
            o.get(x[key]).push(x);
            return o;
        }, new Map());
    }

    completeTransfer(item) {
        this.api.completeTransfer(item.item, item.id).then(response => {
            this.getTransfers();
        });
    }

    deleteItems() {
        let message = 'Delete ' + this.selected.length + ' item?';
        this.dialog.open({viewModel: Prompt, model: message}).whenClosed(response => {
            if (!response.wasCancelled) {
                let promises = []
                for (let item of this.selected) {
                    promises.push(this.api.deleteItem(item.id));
                }
                Promise.all(promises).then(response => {
                    this.getInventory();
                    this.selected.splice(0, this.selected.length);
                });
            }
        });
    }

    exportSelectedItems() {
    }

    exportItems() {
        /*
        let message = 'Export search results';
        this.dialog.open({viewModel: Prompt, model: message}).whenClosed(response => {
            if (!response.wasCancelled) {
                console.log('ok');
            }
        });
        */
    }

}
