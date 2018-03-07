import { inject, bindable, bindingMode } from 'aurelia-framework';

@inject(Element)
export class LlStepFieldCustomElement {
    @bindable field = {};
    @bindable calculations;
    @bindable({defaultBindingMode: bindingMode.twoWay}) outputTo;

    constructor(element) {
        this.element = element;
        this.field.properties = [];
    }

    outputToChanged() {
        if (Object.keys(this.outputTo).length === 0 && this.field) {
            this.outputTo.label = this.field.label;
            this.outputTo.description = this.field.description;
            this.outputTo.properties = this.field.properties;
        }
    }

    addProperty() {
        if (!this.field.properties) {
            this.field.properties = [];
        }
        if (this.field.properties.length < 4) {
            this.field.properties.push({});
        }
    }

    removeProperty(index) {
        this.field.properties.splice(index, 1);
    }
}
