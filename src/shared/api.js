import {inject} from 'aurelia-framework';
import {Config} from 'aurelia-api';

@inject(Config)
export class SharedApi {

    constructor(config) {
        this.endpoint = config.getEndpoint('api');
    }

    // Measures
    measures(params) {
        return this.endpoint.find('measures/', params);
    }

    createMeasure(data) {
        return this.endpoint.create('measures/', data);
    }

    updateMeasure(id, data) {
        return this.endpoint.patchOne('measures/', id, null, data);
    }

    deleteMeasure(id) {
        return this.endpoint.destroyOne('measures/', id);
    }

    // Locations
    locations(params) {
        return this.endpoint.find('locations/', params);
    }

    createLocation(data) {
        return this.endpoint.create('locations/', data);
    }

    updateLocation(id, data) {
        return this.endpoint.patchOne('locations/', id, null, data);
    }

    deleteLocation(id) {
        return this.endpoint.destroyOne('locations/', id);
    }

    // Item types
    itemTypes(params) {
        return this.endpoint.find('itemtypes/', params);
    }

    createItemType(data) {
        return this.endpoint.create('itemtypes/', data);
    }

    updateItemType(id, data) {
        return this.endpoint.patchOne('itemtypes/', id, null, data);
    }

    deleteItemType(id) {
        return this.endpoint.destroyOne('itemtypes/', id);
    }

    // Organisms
    organisms(params) {
        return this.endpoint.find('organisms/', params);
    }

    createOrganism(data) {
        return this.endpoint.create('organisms/', data);
    }

    updateOrganism(id, data) {
        return this.endpoint.patchOne('organisms/', id, null, data);
    }

    deleteOrganism(id) {
        return this.endpoint.destroyOne('organisms/', id);
    }

}
