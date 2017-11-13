import { inject, bindable } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(EventAggregator, Element)
export class UiDropdownMenuItemCustomElement {
    @bindable icon;
    @bindable toggle;
    @bindable toggleSource;

    constructor(eventAggregator, element) {
        this.isToggled = false;
        this.ea = eventAggregator;
        this.element = element;

        this.setToggle = event => {
            if (this.toggle) {
                if (this.toggle in this.toggleSource) {
                    delete this.toggleSource[this.toggle];
                    this.isToggled = false;
                } else {
                    this.toggleSource[this.toggle] = 'True';
                    this.isToggled = true;
                }
                this.ea.publish('queryChanged', {param: this.toggle, source: this.toggleSource});
            }
        };
    }

    attached() {
        if (this.toggle && this.toggle in this.toggleSource) {
            this.isToggled = true;
        }
        this.element.addEventListener('click', this.setToggle);
    }

    detached() {
        this.element.removeEventListener('click', this.setToggle);
    }
}
