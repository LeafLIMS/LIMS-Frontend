import {inject} from 'aurelia-framework';
import {Config} from 'aurelia-api';

@inject(Config)
export class EquipmentApi {

    constructor(config) {
        this.endpoint = config.getEndpoint('api');
    }

    equipment(params) {
        return this.endpoint.find('equipment/', params);
    }

    createEquipment(data) {
        return this.endpoint.create('equipment/', data);
    }

    updateEquipment(id, data) {
        return this.endpoint.patchOne('equipment/', id, null, data);
    }

    deleteEquipment(id) {
        return this.endpoint.destroyOne('equipment/', id);
    }

    reservations(params) {
        return this.endpoint.find('equipmentreservation/', params);
    }

    createReservation(data) {
        return this.endpoint.create('equipmentreservation/', data);
    }

    updateReservation(id, data) {
        return this.endpoint.patchOne('equipmentreservation/', id, null, data);
    }

    deleteReservation(id) {
        return this.endpoint.destroyOne('equipmentreservation/', id);
    }

    copyfiles(params) {
        return this.endpoint.find('copyfiles/', params);
    }

    createCopyfile(data) {
        return this.endpoint.create('copyfiles/', data);
    }

    updateCopyfile(id, data) {
        return this.endpoint.patchOne('copyfiles/', id, null, data);
    }

    deleteCopyfile(id) {
        return this.endpoint.destroyOne('copyfiles/', id);
    }
}
