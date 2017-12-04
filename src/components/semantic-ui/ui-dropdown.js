import { inject, bindable, bindingMode, containerless } from 'aurelia-framework';

@inject(Element)
export class UiDropdownCustomElement {
    @bindable({ defaultBindingMode: bindingMode.twoWay }) value;
    @bindable placeholder;
    @bindable required;

    constructor(element) {
        this.element = element;
    }

    attached() {
        this.dropdown = jQuery('.ui.selection.dropdown', this.element);
        this.dropdown.dropdown();
        // The set up gets called before the elements are in place thus
        // not actually selecting them. This prevents that from happening.
        setTimeout(() => {
            //this.dropdown.dropdown('refresh');
            this.valueChanged(this.value);
        }, 1);
    }

    valueChanged(n) {
        if (this.dropdown) {
            this.value = n;
            if (this.value == "") {
                this.dropdown.dropdown('clear');
            }
            // Clear cache since that seems to stop it from actually selecting anything
            this.dropdown.dropdown('refresh');
            // Set the value as selected to make sure updates happen properly when values
            // are added dynamically.
            this.dropdown.dropdown('set selected', this.value);
        }
    }

}
