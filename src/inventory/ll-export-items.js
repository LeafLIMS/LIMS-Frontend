import { inject, bindable, bindingMode, BindingEngine, NewInstance } from 'aurelia-framework';
import { InventoryApi } from './api';
import { EventAggregator } from 'aurelia-event-aggregator';
import { ValidationRules, ValidationController, validateTrigger } from 'aurelia-validation';
import { UiValidationRenderer } from '../components/semantic-ui/ui-validation-renderer';

@inject(InventoryApi, EventAggregator, NewInstance.of(ValidationController), BindingEngine)
export class LlExportItems {
    @bindable({ defaultBindingMode: bindingMode.twoWay }) toggle;
    @bindable queryData;
    @bindable selected;
    @bindable searchCount;

    constructor(inventoryApi, eventAggregator, validationController, bindingEngine) {
        this.api = inventoryApi;
        this.ea = eventAggregator;
        this.be = bindingEngine;

        this.validator = validationController;
        this.validator.validateTrigger = validateTrigger.changeOrBlur;
        this.validator.addRenderer(new UiValidationRenderer());

        this.exportData = {};
        this.useSelected = false;
        this.count = 0;
        this.download = false;

        this.selectedUpdated = (s) => {
            if (this.selected && this.selected.length > 0) {
                this.useSelected = true;
                this.count = this.selected.length;
            } else {
                this.useSelected = false;
                this.count = this.searchCount;
            }
        }
    }

    toggleChanged() {
        ValidationRules
            .ensure('filetemplate').required()
            .on(this.exportData);
        this.selectedUpdated(false);
    }

    selectedChanged(n) {
        this.checkSelected = this.be.collectionObserver(this.selected)
                                    .subscribe(this.selectedUpdated);
    }

    detached() {
        this.checkSelected.dispose();
    }

    searchCountChanged(n) {
        if (!this.useSelected) {
            this.count = n;
        }
    }

    save() {
        this.validator.validate().then(results => {
            if (results.valid) {
                this.generatingFile = true;
                let selected = false;
                if (this.selected.length > 0) {
                    selected = this.selected.reduce((n, c) => {
                                    return n + (c.id + ",") }, "")
                }
                this.api.exportItems(this.exportData.filetemplate,
                                     selected, this.query).then(response => {
                    this.download = true;
                    this.generatingFile = false;
                    let fileBlob = new Blob([response], {type: 'text/csv'});
                    this.fileUrl = URL.createObjectURL(fileBlob);
                });
            }
        });
    }

    cancel() {
        this.exportData = {};
        this.useSelected = false;
        this.generatingFile = false;
        this.count = 0;
        this.download = false;
        this.toggle = false;
    }
}
