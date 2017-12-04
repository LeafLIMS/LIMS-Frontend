import { inject, bindable, bindingMode } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class LlLinks {
    @bindable({ defaultBindingMode: bindingMode.twoWay }) source;

    constructor(eventAggregator) {
        this.ea = eventAggregator;
        this.link = {};
    }

    sourceChanged() {
        if (this.source && !this.source.links) {
            this.source.links = [];
        }
    }

    save() {
        if (this.link.url != '' && this.link.display_name != '') {
            this.source.links.push(this.link);
            this.ea.publish('projectUpdated', {source: 'links'});
            this.add = false;
            this.link = {};
        }
    }

    remove(index) {
        this.source.links.splice(index, 1);
        this.ea.publish('projectUpdated', {source: 'links'});
    }

    cancel() {
        this.add = false;
        this.link = {};
    }
}
