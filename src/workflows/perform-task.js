import { inject, NewInstance } from 'aurelia-framework';
import { WorkflowApi } from './api';
import {Router} from 'aurelia-router';

@inject(WorkflowApi, Router)
export class PerformTask {

    constructor(workflowApi, router) {
        this.api = workflowApi;
        this.router = router;
        this.isLoading = true;

        this.setup = true;
        this.requirements = false;
    }

    activate(params, routeMap) {
        this.api.runDetail(params.id).then(data => {
            this.run = data;
            routeMap.navModel.title = this.run.name;

            this.taskId = this.run.tasks[this.run.current_task].id;
            this.task_name = this.run.tasks[this.run.current_task].name
            this.taskPosition = this.run.current_task + 1;

            this.api.performTask(params.id).then(data => {
                this.isLoading = false;
                this.monitorData = data;
                this.currentData = data.data[0].data;
                this.selectedData = data.data[0].id;
            });
        });
    }

    toggleSection(section) {
        if (this[section]) {
            this[section] = false;
        } else {
            this[section] = true;
        }
    }

    setSelected(event) {
        this.currentData = this.monitorData.data
                            .find(x => { return x.id == event.target.value}).data;
    }
}
