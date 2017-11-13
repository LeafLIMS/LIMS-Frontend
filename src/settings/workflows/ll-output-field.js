import { inject, bindable, bindingMode } from 'aurelia-framework';

@inject(Element)
export class LlOutputFieldCustomElement {
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
            this.outputTo.from_calculation = this.field.from_calculation;
            this.outputTo.from_input_file = this.field.from_input_file;
            this.outputTo.lookup_type = this.field.lookup_type;
        }
    }
}
