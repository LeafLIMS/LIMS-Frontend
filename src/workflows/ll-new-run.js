import { inject, bindable, bindingMode, NewInstance } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { ValidationRules, ValidationController, validateTrigger } from 'aurelia-validation';
import { UiValidationRenderer } from '../components/semantic-ui/ui-validation-renderer';
import { WorkflowApi } from './api';

@inject(WorkflowApi, EventAggregator, NewInstance.of(ValidationController))
export class LlNewRun {
    @bindable({ defaultBindingMode: bindingMode.twoWay }) toggle;

    constructor(workflowApi, eventAggregator, validationController) {
        this.api = workflowApi;
        this.ea = eventAggregator;

        this.validator = validationController;
        this.validator.validateTrigger = validateTrigger.changeOrBlur;
        this.validator.addRenderer(new UiValidationRenderer());

        this.run = {
            products: [],
        };
        this.config = {
            lookup: 'products',
            displayName: 'product_identifier',
            displayOther: ['name']
        }

        ValidationRules
            .ensure('name').required()
            .ensure('tasks').required()
            .ensure('products').minItems(1).required()
            .on(this.run);

        this.api.workflows({limit: 200}).then(data => {
            this.workflows = data;
        });
    }

    save() {
        this.validator.validate().then(results => {
            if (results.valid) {
                let run = JSON.parse(JSON.stringify(this.run));
                run.products = this.run.products.map((x) => {
                    return x.id;
                });
                this.api.createRun(run).then(data => {
                    this.cancel();
                    this.ea.publish('runAdded', {source: 'newRun'});
                }).catch(err => {
                    this.error = err;
                });
            }
        });
    }

    cancel() {
        this.run = {
            products: [],
        };
        this.toggle = false;
    }
}
