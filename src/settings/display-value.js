import { inject, bindable } from 'aurelia-framework';

@inject(Element)
export class DisplayValueCustomElement {
    @bindable text;

    constructor(element) {
        this.element = element;
    }

    textChanged(n) {
        if (n === true || n === false) {
            this.isBoolean = true;
            this.check = n === true ? 'check circle' : 'remove circle';
        }
    }

}
