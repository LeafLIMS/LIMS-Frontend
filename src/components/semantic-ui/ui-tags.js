import { inject, bindable, bindingMode } from 'aurelia-framework';

export class UiTagsCustomElement {
    @bindable({defaultBindingMode: bindingMode.twoWay}) source;

    remove(index) {
        this.source.splice(index, 1);
    }
}
