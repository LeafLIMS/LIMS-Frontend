import { inject, NewInstance } from 'aurelia-framework';
import { WorkflowApi } from './api';
import {Router} from 'aurelia-router';

@inject(WorkflowApi, Router)
export class FinishTask {

    constructor(workflowApi, router) {
        this.api = workflowApi;
        this.router = router;
        this.isLoading = true;
        this.selected = [];

        this.restartTaskAt = 0;

        this.finishOptions = new Map([
            ['succeeded', 'Succeeded'],
            ['failed', 'Failed'],
            ['repeat succeeded', 'Repeat succeeded'],
            ['repeat failed', 'Repeat Failed'],
        ]);
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
                this.results = data.data.map(x => {
                    x.state = 'succeeded';
                    return x;
                });

                this.restartTaskAt = "" + this.run.current_task;
            });
        });
    }

    setState(event) {
        let value = event.target.value;
        for (let item of this.selected) {
            item.state = value;
        }
    }

    save() {
        let failures = this.results.filter(x => {
            return x.state == 'failed' || x.state == 'repeat failed';
        }).map(x => {
            return x.product;
        }).join(',');
        let data = {
            notes: this.notes,
            failures: failures,
            restart_task_at: this.restartTaskAt,
        };
        this.api.finishTask(this.run.id, data).then(response => {
            this.router.navigateToRoute('workflows');
        }).catch(err => {
            this.error = err;
        });
    }
}
