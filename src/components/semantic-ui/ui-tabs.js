import { inject } from 'aurelia-framework';

@inject(Element)
export class UiTabsCustomElement {

    constructor(element) {
        this.element = element;
    }

    attached() {
        $('.menu .item', this.element).tab();
    }
}
