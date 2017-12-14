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

    createFiletemplate(data) {
        return this.endpoint.create('filetemplates/', data);
    }

    updateFiletemplate(id, data) {
        return this.endpoint.patchOne('filetemplates/', id, null, data);
    }

    deleteFiletemplate(id) {
        return this.endpoint.destroyOne('filetemplates/', id);
    }
}
