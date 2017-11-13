import {inject} from 'aurelia-framework';
import {Config} from 'aurelia-api';

@inject(Config)
export class FiletemplateApi {

    constructor(config) {
        this.endpoint = config.getEndpoint('api');
    }

    filetemplates(params) {
        return this.endpoint.find('filetemplates/', params);
    }
}
