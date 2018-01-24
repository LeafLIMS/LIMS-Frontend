import { inject, NewInstance } from 'aurelia-framework';
import { ProjectApi } from './api';
import { CrmApi } from '../crm/api';
import { EventAggregator } from 'aurelia-event-aggregator';
import { Router } from 'aurelia-router';
import { DialogService } from 'aurelia-dialog';
import { CrmPrompt } from '../crm/crm-prompt';
import { Prompt } from '../components/semantic-ui/ui-prompt';
import { ValidationRules, ValidationController, validateTrigger } from 'aurelia-validation';
import { UiValidationRenderer } from '../components/semantic-ui/ui-validation-renderer';

@inject(ProjectApi, CrmApi, EventAggregator, Router, DialogService,
        NewInstance.of(ValidationController))
export class ProjectDetail {

    constructor(projectApi, crmApi, eventAggregator, router, dialogService, validationController) {
        this.ea = eventAggregator;
        this.api = projectApi;
        this.crmApi = crmApi;
        this.router = router;
        this.dialog = dialogService;

        this.validator = validationController;
        this.validator.validateTrigger = validateTrigger.changeOrBlur;
        this.validator.addRenderer(new UiValidationRenderer());

        this.query = {
            limit: 10,
        }

        this.selected = [];
        this.isLoading = true;

        this.project = {};

        this.setRules();

        this.getProjectStatuses();
    }

    activate(params, routeMap) {
        this.api.projectDetail(params.id).then(data => {
            this.project = data;
            this.setRules();
            routeMap.navModel.title = this.project.name;
            this.getProducts();
        });
    }

    attached() {
        this.updateSubscriber = this.ea.subscribe('projectUpdated', response => {
            this.save();
        });
        this.querySubscriber = this.ea.subscribe('queryChanged', response => {
            this.getProducts();
        });
        this.productSubscriber = this.ea.subscribe('productAdded', response => {
            this.getProducts();
        });
    }

    detached() {
        this.updateSubscriber.dispose();
        this.querySubscriber.dispose();
        this.productSubscriber.dispose();
    }

    setRules() {
        ValidationRules
            .ensure('name').required()
            .ensure('status').required()
            .ensure('primary_lab_contact').required()
            .on(this.project);
    }

    getProducts() {
        this.api.productsForProject(this.project.id, this.query).then(data => {
            console.log('GET PRODUCT FOR PROJECT', this.project.id);
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

    save() {
        this.validator.validate().then(results => {
            if (results.valid) {
                this.api.updateProject(this.project.id, this.project)
                    .then(data => {
                    this.project = data;
                    this.setRules();
                }).catch(err => this.error = err);
            }
        });
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
