import { bindable } from 'aurelia-framework';

export class UiFieldCustomElement {
    @bindable label;
    @bindable required = false;
}
