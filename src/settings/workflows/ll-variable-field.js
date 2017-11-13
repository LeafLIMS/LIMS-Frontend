import { inject, bindable, bindingMode } from 'aurelia-framework';

@inject(Element)
export class LlVariableFieldCustomElement {
    @bindable field;
    @bindable({defaultBindingMode: bindingMode.twoWay}) outputTo;

    constructor(element) {
        this.element = element;
    }

    outputToChanged() {
        if (Object.keys(this.outputTo).length === 0 && this.field) {
            this.outputTo.label = this.field.label;
            this.outputTo.amount = this.field.amount;
            this.outputTo.measure = this.field.measure;
            this.outputTo.measure_not_required = this.field.measure_not_required;
        }
    }
}
