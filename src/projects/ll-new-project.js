import { inject, bindable, bindingMode, BindingEngine, NewInstance } from 'aurelia-framework';
import { ProjectApi } from './api';
import { UserApi } from '../auth/api';
import { CrmApi } from '../crm/api';
import { EventAggregator } from 'aurelia-event-aggregator';
import { Router } from 'aurelia-router';
import { ValidationRules, ValidationController, validateTrigger } from 'aurelia-validation';
import { UiValidationRenderer } from '../components/semantic-ui/ui-validation-renderer';
import { AureliaConfiguration } from 'aurelia-configuration';

@inject(ProjectApi, UserApi, EventAggregator, NewInstance.of(ValidationController), Router,
        AureliaConfiguration, CrmApi, BindingEngine)
export class LlNewProject {
    @bindable source;
    @bindable({ defaultBindingMode: bindingMode.twoWay }) toggle;

    constructor(projectApi, userApi, eventAggregator, validationController, router,
                aureliaConfiguration, crmApi, bindingEngine) {
        this.api = projectApi;
        this.userApi = userApi;
        this.crmApi = crmApi;
        this.ea = eventAggregator;
        this.be = bindingEngine;
        this.router = router;
        this.config = aureliaConfiguration;

        this.validator = validationController;
        this.validator.validateTrigger = validateTrigger.changeOrBlur;
        this.validator.addRenderer(new UiValidationRenderer());

        this.project = {};

        this.dateConfig = {
            type: 'date',
            today: true,
        }

        ValidationRules
            .ensure('name').required()
            .ensure('status').required()
            .ensure('primary_lab_contact').required()
            .on(this.project);

        this.api.projectStatuses().then(data => {
            this.statuses = data;
        });

        this.be.propertyObserver(this, 'crm_project').subscribe((n, o) => {
            let selected = n;
            this.crmApi.crmProjects({id: selected}).then(data => {
                let p = data.results[0];
                this.project.name = p.Name;
                this.project.description = p.Description;
                this.project.crmId = p.Id;
            });
        });
    }

    save() {
        this.validator.validate().then(results => {
            if (results.valid) {
                this.api.createProject(this.project).then(data => {
                    if (this.project.crmId) {
                        this.crmApi.associateCRMProject(data.id, this.project.crmId);
                    }
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
