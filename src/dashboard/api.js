import {inject} from 'aurelia-framework';
import {Config} from 'aurelia-api';

@inject(Config)
export class StatsApi {

    constructor(config) {
        this.endpoint = config.getEndpoint('api');
    }

    stats(endpoint, field) {
        let path = `${endpoint}/stats/`;
        return this.endpoint.find(path, {field: field});
    }

}
