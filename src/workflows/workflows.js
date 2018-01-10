import { inject, NewInstance } from 'aurelia-framework';
import { WorkflowApi } from './api';
import { EventAggregator } from 'aurelia-event-aggregator';
import { DialogService } from 'aurelia-dialog';
import { Prompt } from '../components/semantic-ui/ui-prompt';

@inject(WorkflowApi, EventAggregator, DialogService)
export class Workflow {

    constructor(workflowApi, eventAggregator, dialogService) {
        this.api = workflowApi;
        this.ea = eventAggregator;
        this.dialog = dialogService;
        this.limitTo = false;

        this.isLoading = true;

        this.query = {
            is_active: 'True',
        }

        this.productMatcher = (a, b) => a === b;
    }

    activate(params, routeMap) {
        if (params.id) {
            this.limitTo = params.id;
        } else {
            this.limitTo = false;
        }
        console.log(this.limitTo);
        this.getRuns();
    }

    attached() {
        this.runSubscriber = this.ea.subscribe('runAdded', response => {
            this.getRuns();
        });
        this.runUpdatedSubscriber = this.ea.subscribe('runUpdated', response => {
            this.getRuns();
        });
    }

    detached() {
        this.runSubscriber.dispose();
        this.runUpdatedSubscriber.dispose();
    }

    getRuns() {
        if (this.limitTo) {
            this.query.id = this.limitTo;
        } else {
            delete this.query.id;
        }
        this.api.runs(this.query).then(data => {
            data.results.map(x => {
                x.selected = [];
                return x;
            });
            this.runs = data;
            this.isLoading = false;
        });
    }

    exclude(run, itemId) {
        let excluded = run.exclude ? run.exclude.split(',') : [];
        let sId = itemId.toString();
        if (excluded.indexOf(sId) !== -1) {
            excluded.splice(excluded.indexOf(sId), 1);
        } else {
            excluded.push(sId);
        }
        run.exclude = excluded.join(',');
        this.api.updateRun(run.id, {exclude: run.exclude}).catch(err => {
            this.error = err;
        });
    }

    stopRun(id) {
        let message = 'Stop this run?';
        this.dialog.open({viewModel: Prompt, model: message}).whenClosed(response => {
            if (!response.wasCancelled) {
                this.api.updateRun(id, {is_active: false}).then(response => {
                    this.getRuns();
                }).catch(err => {
                    this.error = err;
                });
            }
        });
    }

    editRun(run) {
        run.edit = true;
    }

    addProducts(run) {
        run.addProducts = true;
    }

    workflowFromRun(run) {
        run.toWorkflow = true;
    }

    removeProducts(run) {
        let message = 'Remove ' + run.selected.length + ' products from run?';
        this.dialog.open({viewModel: Prompt, model: message}).whenClosed(response => {
            if (!response.wasCancelled) {
                let selectedIds = run.selected.map(x => { return x.id });
                let diffIds = run.products.filter(x => selectedIds.indexOf(x) < 0);
                this.api.updateRun(run.id, {products: diffIds}).then(x => {
                    run.products_list = x.products_list;
                }).catch(err => {
                    this.error = err;
                });
            }
        });
    }
}
