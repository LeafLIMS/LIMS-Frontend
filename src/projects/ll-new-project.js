import { inject, bindable, bindingMode, NewInstance } from 'aurelia-framework';
import { ProjectApi } from './api';
import { UserApi } from '../auth/api';
import { EventAggregator } from 'aurelia-event-aggregator';
import { Router } from 'aurelia-router';
import { ValidationRules, ValidationController, validateTrigger } from 'aurelia-validation';
import { UiValidationRenderer } from '../components/semantic-ui/ui-validation-renderer';

@inject(ProjectApi, UserApi, EventAggregator, NewInstance.of(ValidationController), Router)
export class LlNewProject {
    @bindable source;
    @bindable({ defaultBindingMode: bindingMode.twoWay }) toggle;

    constructor(projectApi, userApi, eventAggregator, validationController, router) {
        this.api = projectApi;
        this.userApi = userApi;
        this.ea = eventAggregator;
        this.router = router;

        this.validator = validationController;
        this.validator.validateTrigger = validateTrigger.changeOrBlur;
        this.validator.addRenderer(new UiValidationRenderer());

        this.project = {};

        ValidationRules
            .ensure('name').required()
            .ensure('status').required()
            .ensure('primary_lab_contact').required()
            .on(this.project);

        this.api.projectStatuses().then(data => {
            this.statuses = data;
        });

        this.userApi.users().then(data => {
            this.labContacts = data.results;
        });
    }

    save() {
        this.validator.validate().then(results => {
            if (results.valid) {
                this.api.createProject(this.project).then(data => {
                    this.router.navigateToRoute('projectDetail', {id: data.id});
                }).catch(err => {
                    this.errors = err;
                });
            }
        });
    }

    cancel() {
        this.project = {};
        this.toggle = false;
    }
}
