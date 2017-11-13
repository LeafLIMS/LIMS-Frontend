import { inject, bindable, bindingMode } from 'aurelia-framework';

@inject(Element)
export class UiToggle {
    @bindable({defaultBindingMode: bindingMode.twoWay}) value;
    @bindable({defaultBindingMode: bindingMode.twoWay}) checked;
    @bindable label;
}
