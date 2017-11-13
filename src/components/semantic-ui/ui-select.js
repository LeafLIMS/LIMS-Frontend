import { inject, bindable, bindingMode } from 'aurelia-framework';

@inject(Element)
export class UiSelectCustomAttribute {
    @bindable required;
    @bindable({defaultBindingMode: bindingMode.twoWay}) value;

    constructor(element) {
        this.element = element;
    }

    attached() {
        this.element.classList.add('ui');
        this.element.classList.add('dropdown');
        jQuery(this.element).dropdown({onChange: v => {
            this.value = v;
        }});
    }
}
