import { bindable, inject } from 'aurelia-framework';

@inject(Element)
export class UiDimmerCustomAttribute {
    @bindable active;

    constructor(element) {
        this.element = element;
    }

    activeChanged(n) {
        if (n) {
            //jQuery('[ui-dimmer]').dimmer('hide');
            jQuery('.dimmer').dimmer('show');
        } else {
            jQuery('[ui-dimmer]').dimmer('show');
        }

    }
}
