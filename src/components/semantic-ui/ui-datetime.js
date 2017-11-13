import { inject, bindable, bindingMode } from 'aurelia-framework';
import { calendar } from 'semantic-ui-calendar';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(Element, EventAggregator)
export class UiDatetime {
    @bindable({defaultBindingMode: bindingMode.twoWay}) value;
    @bindable config = {};

    constructor(element, eventAggregator) {
        this.element = element;
        this.ea = eventAggregator;

        this.defaults = {
            type: 'datetime',
            onChange: (date, text, mode) => {
                this.value = date;
                this.ea.publish('date-changed', {source: 'ui-datetime', value: this.value,
                                                 target: this.element});
                return true;
            },
        }
    }

    attached() {
        this.datetime = $('.datetime', this.element)
                            .calendar(Object.assign(this.defaults, this.config));
        setTimeout(() => {
            if (this.value) {
                this.valueChanged(this.value);
            }
        }, 1);
    }

    valueChanged(n) {
        if (this.datetime && n) {
            if (this.value._isAMomentObject) {
                this.value = this.value.toDate();
            }
            this.datetime.calendar('set date', this.value, true, false);
        }
    }
}
