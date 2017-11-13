import {inject} from 'aurelia-framework';
import {Config} from 'aurelia-api';

@inject(Config)
export class InventoryApi {

    constructor(config) {
        this.endpoint = config.getEndpoint('api');
    }

    inventory(params) {
        return this.endpoint.find('inventory/', params);
    }

    inventoryDetail(id, params) {
        return this.endpoint.findOne('inventory/', id, params);
    }

    transfers(params) {
        return this.endpoint.find('transfers/', params);
    }

    groupedTransfers(params) {
        return this.endpoint.find('transfers/grouped/', params);
    }

    createItem(data) {
        return this.endpoint.create('inventory/', data);
    }

    updateItem(id, data) {
        return this.endpoint.patchOne('inventory/', id, null, data);
    }

    deleteItem(id) {
        return this.endpoint.destroyOne('inventory/', id);
    }

    createMultipleItems(data) {
        let path = 'inventory/importitems/';
        return this.endpoint.client.fetch(path, {
            method: 'post',
            body: data
        });
    }

    createTransfer(id, data) {
        let path = `inventory/${id}/transfer/`;
        return this.endpoint.request('POST', path, data);
    }

    completeTransfer(itemId, transferId) {
        let path = `inventory/${itemId}/transfer/?id=${transferId}&complete=True`;
        return this.endpoint.request('POST', path);
    }

    itemTypes(params) {
        return this.endpoint.find('itemtypes/', params);
    }

}
