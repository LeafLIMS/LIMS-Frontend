import {inject} from 'aurelia-framework';
import {Config} from 'aurelia-api';

@inject(Config)
export class StatsApi {

    constructor(config) {
        this.endpoint = config.getEndpoint('api');
    }

    stats(endpoint, field, exclude) {
        let data = {field: field};
        if (exclude) {
            data.exclude = exclude;
        }
        let path = `${endpoint}/stats/`;
        return this.endpoint.find(path, data);
    }

}
