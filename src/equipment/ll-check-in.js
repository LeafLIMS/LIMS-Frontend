import { inject, bindable, bindingMode, NewInstance } from 'aurelia-framework';
import { EquipmentApi } from './api';
import { EventAggregator } from 'aurelia-event-aggregator';
import { AuthService } from 'aurelia-authentication';
import moment from 'moment';
import 'moment-timezone';

@inject(EquipmentApi, EventAggregator, AuthService)
export class LlCheckIn {
    @bindable({ defaultBindingMode: bindingMode.twoWay }) toggle;

    constructor(equipmentApi, eventAggregator, authService) {
        this.api = equipmentApi;
        this.ea = eventAggregator;
        this.auth = authService;
    }

    toggleChanged(n) {
        if (n) {
            let format = 'YYYY-MM-DDTHH:mm:ssZZ';
            let payload = this.auth.getTokenPayload();
            let timezone = moment.tz.guess();
            let start = moment.tz([], timezone).subtract(1, 'hours');
            let end = moment.tz([], timezone).add(1, 'hours');
            let params = {
                checked_in: 'False',
                reserved_by__username: payload.username,
                start__gte: start.format(format),
                start__lte: end.format(format),
            }
            this.api.reservations(params).then(data => {
                this.checkIns = data;
            });
        }
    }

    save() {
        let promises = [];
        for (let checkin of this.checkIns.results) {
            delete checkin.confirmed_by;
            promises.push(this.api.updateReservation(checkin.id, checkin));
        }
        Promise.all(promises).then(response => {
            this.ea.publish('refetch-events', {source: 'check-in'});
            this.cancel();
        });
    }

    cancel() {
        this.toggle = false;
    }
}
