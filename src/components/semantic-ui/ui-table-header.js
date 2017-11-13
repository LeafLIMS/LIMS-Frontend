import { inject, bindable, bindingMode, NewInstance } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { ValidationRules, ValidationController, validateTrigger } from 'aurelia-validation';
import { UiValidationRenderer } from './ui-validation-renderer';

@inject(EventAggregator, NewInstance.of(ValidationController))
export class UiTableHeaderCustomElement {
    @bindable({ defaultBindingMode: bindingMode.twoWay }) search;
    @bindable searchOptions;
    @bindable({ defaultBindingMode: bindingMode.twoWay }) searchQuery;

    constructor(eventAggregator, validationController) {
        this.ea = eventAggregator;

        this.validator = validationController;
        this.validator.validateTrigger = validateTrigger.changeOrBlur;
        this.validator.addRenderer(new UiValidationRenderer());

        this.showAdvanced = false;

        this.searchTerms = [];

        this.fieldOperatorNames = [
            ['exact', 'is'],
            ['icontains', 'contains'],
            ['lt', 'less than (<)'],
            ['gt', 'greater than (>)'],
            ['lte', 'less than or equal to (<=)'],
            ['gte', 'greater than or equal to (>=)'],
        ];
    }

    attached() {
        // Deep copy values of original query for reset
        this.originalQuery = JSON.parse(JSON.stringify(this.searchQuery));
        this.addTerm();
    }

    searchChanged() {
        this.ea.publish('queryChanged', {source: 'search'});
    }

    toggleAdvanced() {
        this.showAdvanced = this.showAdvanced ? false : true;
    }

    addTerm() {
        this.searchTerms.push({value: ''});
        let length = this.searchTerms.length - 1;
        ValidationRules.ensure('field').required()
                       .ensure('action').required()
                       .ensure('value').required()
                       .on(this.searchTerms[length]);
    }

    removeTerm(index) {
        if (this.searchTerms.length > 1) {
            this.searchTerms.splice(index, 1);
        }
    }

    setFields(event, term) {
        let fieldName = event.target.value;
        let field = this.searchOptions.fields.find(x => { return x.name == fieldName });
        let operators = field.op;
        let availableOps = this.fieldOperatorNames.filter(x => {
            return operators.indexOf(x[0]) !== -1 });
        term.operators = new Map(availableOps);
    }

    cleanQuery() {
        for (let [key, term] of Object.entries(this.searchQuery)) {
            // Only effect things not in original query
            if (!(key in this.originalQuery)) {
                delete this.searchQuery[key];
            }
        }
    }

    doSearch() {
        this.validator.validate().then(results => {
            if (results.valid) {
                this.cleanQuery();
                for (let term of this.searchTerms) {
                    let searchKey = term.field;
                    if (term.action !== 'exact') {
                        searchKey = `${term.field}__${term.action}`;
                    }
                    this.searchQuery[searchKey] = term.value;
                }
                this.ea.publish('queryChanged', {source: 'advancedSearch'});
            }
        });
    }
}
