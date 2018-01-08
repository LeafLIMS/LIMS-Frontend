import { inject, NewInstance, bindable, bindingMode } from 'aurelia-framework';
import { WorkflowApi } from './api';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(WorkflowApi, EventAggregator)
export class LlEditRun {
    @bindable({ defaultBindingMode: bindingMode.twoWay }) toggle;
    @bindable source;

    constructor(workflowApi, eventAggregator) {
        this.api = workflowApi;
        this.ea = eventAggregator;
    }

    sourceChanged(n) {
        this.run = n;
        this.tasks = this.run.tasks_list.slice(0);
    }

    addAfter(index, task) {
        // Add in dialog here to find tasks
        this.tasks.splice(index + 1, 0, {select: true});
    }

    removeTask(index, task) {
        this.tasks.splice(index, 1);
    }

    save() {
        // Convert task_list to tasks
        this.run.tasks = this.tasks.map(x => x.id).join(',');
        this.api.updateRun(this.run.id, this.run).then(data => {
            this.source = data;
            this.ea.publish('runUpdated', {source: 'editRun'});
            this.cancel();
        });
    }

    cancel() {
        this.toggle = false;
    }
}
