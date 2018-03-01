import { inject, bindable, bindingMode } from 'aurelia-framework';

@inject(Element)
export class LlCalculationFieldCustomElement {
    @bindable field;
    @bindable({defaultBindingMode: bindingMode.twoWay}) outputTo;

    constructor(element) {
        this.element = element;
    }

    outputToChanged() {
        if (this.outputTo && Object.keys(this.outputTo).length === 0 && this.field) {
            this.outputTo.label = this.field.label;
            this.outputTo.calculation = this.field.calculation;
            this.outputTo.id = this.field.id;
        }
    }
}
