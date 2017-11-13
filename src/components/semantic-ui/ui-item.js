import { inject, bindable } from 'aurelia-framework';

@inject(Element)
export class UiItem {
    @bindable value;

    constructor(element) {
        this.element = element;
    }

    attached() {
        this.element.setAttribute('data-value', this.value);
    }

}
