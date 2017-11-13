import { inject, bindable, bindingMode } from 'aurelia-framework';

@inject(Element)
export class LlStepFieldCustomElement {
    @bindable field;
    @bindable({defaultBindingMode: bindingMode.twoWay}) outputTo;

    constructor(element) {
        this.element = element;
    }

    outputToChanged() {
        if (Object.keys(this.outputTo).length === 0 && this.field) {
            this.outputTo.label = this.field.label;
            this.outputTo.description = this.field.description;
            this.outputTo.properties = this.field.properties;
        }
    }
}
