import { inject, bindable, bindingMode, NewInstance } from 'aurelia-framework';
import { EquipmentApi } from './api';
import { EventAggregator } from 'aurelia-event-aggregator';
import { ValidationRules, ValidationController, validateTrigger } from 'aurelia-validation';
import { UiValidationRenderer } from '../components/semantic-ui/ui-validation-renderer';
import moment from 'moment';
import 'moment-timezone';

@inject(EquipmentApi, EventAggregator, NewInstance.of(ValidationController))
export class LlCreateReservation {
    @bindable({ defaultBindingMode: bindingMode.twoWay }) source;
    @bindable({ defaultBindingMode: bindingMode.twoWay }) toggle;

    constructor(equipmentApi, eventAggregator, validationController) {
        this.api = equipmentApi;
        this.ea = eventAggregator;

        this.validator = validationController;
        this.validator.validateTrigger = validateTrigger.changeOrBlur;
        this.validator.addRenderer(new UiValidationRenderer());

        this.config = {
            type: 'date',
            today: true,
        }

        this.source = {};
        // Need to zero pad these in the text
        this.hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
        this.minutes = ['0', '15', '30', '45'];
        // Guess the timezone so we don't have to hardcode
        this.timezone = moment.tz.guess();

        let now = moment.tz([], this.timezone);
        // Let next time be half an hour later
        let later = moment.tz([], this.timezone);
        later.add(30, 'm');

        // From date/times
        this.source.from_date = now;
        this.source.from_hour = now.hour();
        this.source.from_minute = "" + this.roundDate(now, 'minutes', 15).minute();

        // To date/times
        this.source.to_date = later;
        this.source.to_hour = later.hour();
        this.source.to_minute = "" + this.roundDate(later, 'minutes', 15).minute();

        this.api.equipment({can_reserve: 'True'}).then(data => {
            this.equipment = data;
        });

        this.dateChangedWatcher = this.ea.subscribe('date-changed',
                                                    response => this.dateChanged(response));

    }

    sourceChanged(n) {
        if (this.source.start && this.source.end) {
            this.source.from_date = this.source.start.toDate();
            this.source.from_hour = this.source.start.hour();
            this.source.from_minute = "" + this.source.start.minute();
            this.source.to_date = this.source.end.toDate();
            this.source.to_hour = this.source.end.hour();
            this.source.to_minute = "" + this.source.end.minute();
        } else {
            let now = moment.tz([], this.timezone);
            // Let next time be half an hour later
            let later = moment.tz([], this.timezone);
            later.add(30, 'm');

            // From date/times
            this.source.from_date = now;
            this.source.from_hour = now.hour();
            this.source.from_minute = "" + this.roundDate(now, 'minutes', 15).minute();

            // To date/times
            this.source.to_date = later;
            this.source.to_hour = later.hour();
            this.source.to_minute = "" + this.roundDate(later, 'minutes', 15).minute();
        }
        ValidationRules
            .ensure('equipment_reserved').required()
            .ensure('from_date').required()
            .ensure('from_hour').required()
            .ensure('from_minute').required()
            .ensure('to_date').required()
            .ensure('to_hour').required()
            .ensure('to_minute').required()
            .on(this.source);
    }

    detached() {
        this.dateChangedWatcher.dispose();
    }

    roundDate(date, type, offset) {
       let val = date[type]();
       let roundedVal = Math.ceil((val+1)/offset)*offset;
       return date[type](roundedVal);
    }

    dateChanged(event) {
        // This helpful hack ensure that the change happens BEFORE the event :P
        setTimeout(() => {
            // Check if this is from date or time
            if (event.target.attributes.name) {
                // Check for dat changes
                if (event.target.attributes.name.value == 'from_date') {
                    if (this.source.from_date > this.source.to_date) {
                        this.source.to_date = this.source.from_date;
                    }
                }
                if (event.target.attributes.name.value == 'to_date') {
                    if (this.source.to_date < this.source.from_date) {
                        this.source.from_date = this.source.to_date;
                    }
                }
            } else {
                // Gotta be a time change
                let name = event.target.parentElement.parentElement.attributes.name.value;
                if (name == 'from_hour') {
                    if ((this.source.from_date.toDateString() ==
                        this.source.to_date.toDateString()) &&
                        (parseInt(this.source.from_hour) >
                         parseInt(this.source.to_hour))) {
                        this.source.to_hour = parseInt(this.source.from_hour);
                    }
                }
                if (name == 'to_hour') {
                    if (this.source.from_date == this.source.to_date &&
                        this.source.to_hour < this.source.from_hour) {
                        this.source.from_hour == this.source.to_hour;
                    }
                }
            }
        }, 1);
    }

    save() {
        this.validator.validate().then(results => {
            if (results.valid) {
                let format = 'YYYY-MM-DDTHH:mm:ssZZ';
                let start = moment.tz(this.source.from_date, this.timezone);
                start.hour(this.source.from_hour);
                start.minute(this.source.from_minute);
                this.source.start = start.format(format);

                let end = moment.tz(this.source.to_date, this.timezone);
                end.hour(this.source.to_hour);
                end.minute(this.source.to_minute);
                this.source.end = end.format(format);
                if (this.source.id) {
                    let updateValues = {
                        start: this.source.start,
                        end: this.source.end,
                        equipment_reserved: this.source.equipment_reserved,
                        reservation_details: this.source.reservation_details,
                    }
                    this.api.updateReservation(this.source.id, updateValues).then(data => {
                        this.ea.publish('refetch-events', {source: 'update-reservation'});
                        this.cancel();
                    }).catch(err => this.error = err);
                } else {
                    // Finally save the source
                    this.api.createReservation(this.source).then(data => {
                        this.ea.publish('refetch-events', {source: 'create-reservation'});
                        this.cancel();
                    }).catch(err => this.error = err);
                }
            }
        });
    }

    cancel() {
        this.toggle = false;
        this.source = {};
    }
}
