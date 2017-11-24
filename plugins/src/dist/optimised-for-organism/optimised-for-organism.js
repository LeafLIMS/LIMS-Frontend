import { inject, bindable, bindingMode } from 'aurelia-framework';
import { SharedApi } from '../../../shared/api';

@inject(SharedApi)
export class OptimisedForOrganism {
    constructor(sharedApi) {
        this.api = sharedApi;

        this.api.organisms().then(data => {
            this.organisms = data;
        });
    }

    activate(model) {
        // Prevent any issues with slow loading of items
        setTimeout(() => {
            this.source = model;
        }, 1);
    }
}
