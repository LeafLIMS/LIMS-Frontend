import { bindable, inject, bindingMode } from 'aurelia-framework';

@inject(Element)
export class UiCheckbox {
    @bindable({defaultBindingMode: bindingMode.twoWay}) checked;
    @bindable model;
    @bindable matcher;
    @bindable label;

    constructor(element) {
        this.element = element;
    }

    attached() {
        $('.ui.checkbox', this.element).checkbox();
    }
}
