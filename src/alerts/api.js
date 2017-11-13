import {inject} from 'aurelia-framework';
import {Config} from 'aurelia-api';

@inject(Config)
export class AlertApi {

    constructor(config) {
        this.endpoint = config.getEndpoint('api');
    }

    alerts(params) {
        return this.endpoint.find('alerts/', params);
    }

    updateAlert(id) {
        let path = `alerts/${id}/dismiss/`;
        return this.endpoint.destroy(path);
    }

    triggerSets(params) {
        return this.endpoint.find('triggersets/', params);
    }

    createTriggerSet(data) {
        return this.endpoint.create('triggersets/', data);
    }

    updateTriggerSet(id, data) {
        return this.endpoint.patchOne('triggersets/', id, null, data);
    }

    deleteTriggerSet(id) {
        return this.endpoint.destroyOne('triggersets/', id);
    }

    triggers(params) {
        return this.endpoint.find('triggers/', params);
    }

    createTrigger(data) {
        return this.endpoint.create('triggers/', data);
    }

    updateTrigger(id, data) {
        return this.endpoint.patchOne('triggers/', id, null, data);
    }

    deleteTrigger(id) {
        return this.endpoint.destroyOne('triggers/', id);
    }

    subscriptions(params) {
        return this.endpoint.find('subscriptions/', params);
    }

    createSubscription(data) {
        return this.endpoint.create('subscriptions/', data);
    }

    updateSubscription(id, data) {
        return this.endpoint.patchOne('subscriptions/', id, null, data);
    }

    deleteSubscription(id) {
        return this.endpoint.destroyOne('subscriptions/', id);
    }

    modelFields(modelName) {
        let path = `${modelName}/`;
        return this.endpoint.request('OPTIONS', path);
    }
}
