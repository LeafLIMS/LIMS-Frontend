import { inject } from 'aurelia-framework';
import { ProjectApi } from './api';
import { CrmApi } from '../crm/api';
import { EventAggregator } from 'aurelia-event-aggregator';
import { Router } from 'aurelia-router';
import { DialogService } from 'aurelia-dialog';
import { CrmPrompt } from '../crm/crm-prompt';
import { Prompt } from '../components/semantic-ui/ui-prompt';

@inject(ProjectApi, CrmApi, EventAggregator, Router, DialogService)
export class ProjectDetail {

    constructor(projectApi, crmApi, eventAggregator, router, dialogService) {
        this.ea = eventAggregator;
        this.api = projectApi;
        this.crmApi = crmApi;
        this.router = router;
        this.dialog = dialogService;

        this.query = {
            limit: 10,
        }

        this.selected = [];
        this.isLoading = true;

        this.getProjectStatuses();
    }

    activate(params, routeMap) {
        this.api.projectDetail(params.id).then(data => {
            this.project = data;
            routeMap.navModel.title = this.project.name;
            this.getProducts();
        });
    }

    attached() {
        this.updateSubscriber = this.ea.subscribe('projectUpdated', response => {
            this.updateProject();
        });
        this.querySubscriber = this.ea.subscribe('queryChanged', response => {
            this.getProducts();
        });
        this.productSubscriber = this.ea.subscribe('productAdded', response => {
            this.getProducts();
        });
    }

    detatched() {
        this.updateSubscriber.dispose();
        this.querySubscriber.dispose();
        this.productSubsciber.dispose();
    }

    getProducts() {
        this.api.productsForProject(this.project.id, this.query).then(data => {
            // Set toggled to false to allow for hide/show behaviour
            data.results = data.results.map(x => { x.toggled = false; return x });
            this.products = data;
            this.isLoading = false;
        });
    }

    getProjectStatuses() {
        this.api.projectStatuses({limit: 200}).then(data => {
            this.statuses = data;
        });
    }

    setStatus(event) {
        setTimeout(() => {
            this.updateProject();
        }, 1);
    }

    updateProject() {
        this.api.updateProject(this.project.id, this.project).then(data => {
            this.project = data;
        });
    }

    updateDescription() {
        this.api.updateProject(this.project.id, {description: this.project.description})
            .then(data => {
            this.project = data;
        }).catch(err => this.error = err);
    }

    deleteItems() {
        let message = 'Delete ' + this.selected.length + ' products?';
        this.dialog.open({viewModel: Prompt, model: message}).whenClosed(response => {
            if (!response.wasCancelled) {
                let promises = []
                for (let item of this.selected) {
                    promises.push(this.api.deleteProduct(item.id));
                }
                Promise.all(promises).then(response => {
                    this.getProducts();
                    this.selected.splice(0, this.selected.length);
                });
            }
        });
    }
}
