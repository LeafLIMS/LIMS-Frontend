import { inject, bindable, bindingMode } from 'aurelia-framework';

@inject(Element)
export class UiTableSelectCustomElement {
    @bindable({defaultBindingMode: bindingMode.twoWay}) selectTo;
    @bindable selectAs;
    @bindable selectMatcher = (a, b) => a.id === b.id;

    constructor(element) {
        this.element = element;
    }

    attached() {
        jQuery('.ui.table.checkbox', this.element).checkbox();
    }

    selectMatcherChanged(n, o) {
         this.selectMatcher = n;
    }
}
