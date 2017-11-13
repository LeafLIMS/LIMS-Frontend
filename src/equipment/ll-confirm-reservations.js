import { inject, bindable, bindingMode, NewInstance } from 'aurelia-framework';
import { EquipmentApi } from './api';
import { EventAggregator } from 'aurelia-event-aggregator';
import { AuthService } from 'aurelia-authentication';
import moment from 'moment';
import 'moment-timezone';

@inject(EquipmentApi, EventAggregator, AuthService)
export class LlConfirmReservations {
    @bindable({ defaultBindingMode: bindingMode.twoWay }) toggle;

    constructor(equipmentApi, eventAggregator, authService) {
        this.api = equipmentApi;
        this.ea = eventAggregator;
        this.auth = authService;
    }

    toggleChanged(n) {
        if (n) {
            let format = 'YYYY-MM-DDTHH:mm:ssZZ';
            let now = moment.tz([], moment.tz.guess()).format(format);
            let params = {
                is_confirmed: 'False',
                start__gte: now,
            }
            this.api.reservations(params).then(data => {
                this.reservations = data;
            });
        }
    }

    save() {
        let promises = [];
        for (let r of this.reservations.results) {
            delete r.confirmed_by;
            promises.push(this.api.updateReservation(r.id, r));
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
