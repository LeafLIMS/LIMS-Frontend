import { inject, NewInstance, bindable, bindingMode } from 'aurelia-framework';
import { WorkflowApi } from './api';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(WorkflowApi, EventAggregator)
export class LlRunToWorkflow {
    @bindable({ defaultBindingMode: bindingMode.twoWay }) toggle;
    @bindable source;

    constructor(workflowApi, eventAggregator) {
        this.api = workflowApi;
        this.ea = eventAggregator;
        this.data = {};
    }

    sourceChanged(n) {
        this.run = n;
        this.tasks = this.run.tasks_list.slice(0);
    }

    save() {
        // Convert task_list to tasks
        this.data.order = this.tasks.map(x => x.id).join(',');
        this.api.createWorkflow(this.data).then(response => {
            this.cancel();
            this.ea.publish('runToWorkflow', {source: 'runToWorkflow'});
        });
    }

    cancel() {
        this.toggle = false;
    }
}
