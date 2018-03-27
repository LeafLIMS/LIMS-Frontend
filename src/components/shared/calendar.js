import { inject, bindable, bindingMode, BindingEngine } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import moment from 'moment';
import { fullCalendar } from 'fullcalendar';

@inject(Element, BindingEngine, EventAggregator)
export class CalendarCustomElement {
    @bindable dayClick;
    @bindable eventClick;
    @bindable events = [];
    @bindable options;
    @bindable view;

    subscription = null;

    constructor(element, bindingEngine, eventAggregator) {
        this.element = element;
        this.bindingEngine = bindingEngine;
        this.ea = eventAggregator;

        this.subscription = this.bindingEngine.collectionObserver(this.events)
                                              .subscribe(splices => this.eventListChanged(splices));

        this.updateSubscriber = this.ea.subscribe('refetch-events', response => {
            if (this.calendar) {
                this.calendar.fullCalendar('refetchEvents');
            }
        });
    }

    eventListChanged(splices) {
        if (this.calendar) {
            for (let e of this.events) {
                this.calendar.fullCalendar('addEventSource', e);
            }
        }
    }

    eventsChanged(n, o) {
        if(this.subscription !== null) {
            this.subscription.dispose();
        }
        this.subscription = this.bindingEngine.collectionObserver(this.events)
                                              .subscribe(splices => this.eventListChanged(splices));
        if (this.calendar) {
            this.calendar.fullCalendar('refetchEvents');
        }
    }

    attached() {
        this.calendar = $(this.element);

        let eventSource = (start, end, timezone, callback) => {
            callback(this.events);
        };

        let defaultValues = {
            defaultView: this.view || 'month',
            weekends: true,
            firstDay: 1,
            eventSources: this.events,
            viewRender: (view, element) => {
                let windowSize = $(window).width();
                if (windowSize <= 768) {
                    this.calendar.fullCalendar('changeView', 'listWeek');
                }
            },
            windowResize: view => {
                let windowSize = $(window).width();
                if (windowSize <= 768) {
                    this.calendar.fullCalendar('changeView', 'listWeek');
                }
            }
        }

        this.calendar.fullCalendar(Object.assign(defaultValues, this.options));
    }

    detached() {
        this.subscription.dispose();
    }
}
