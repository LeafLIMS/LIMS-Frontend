import { bindable } from 'aurelia-framework';

export class UiDropdownMenuCustomElement {
    @bindable icon;
    @bindable text;

    attached() {
        jQuery('.ui.dropdown').dropdown();
    }
}
