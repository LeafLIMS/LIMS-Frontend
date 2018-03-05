import { inject, bindable, bindingMode } from 'aurelia-framework';

@inject(Element)
export class UiDisappearingMessageCustomElement {
    @bindable title;
    @bindable text;
    @bindable wait = 10;
    @bindable colour;
    @bindable({defaultBindingMode: bindingMode.twoWay}) visible;

    constructor(element) {
        this.element = element;
    }

    visibleChanged(n) {
        if (this.visible) {
            $(this.element).delay(this.wait * 1000).fadeOut('slow');
        }
    }
}
