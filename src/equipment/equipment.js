import { inject, NewInstance } from 'aurelia-framework';
import { EquipmentApi } from './api';
import { EventAggregator } from 'aurelia-event-aggregator';
import { DialogService } from 'aurelia-dialog';
import { Prompt } from '../components/semantic-ui/ui-prompt';
import { AuthService } from 'aurelia-authentication';
import moment from 'moment';
import 'moment-timezone';

@inject(EquipmentApi, EventAggregator, DialogService, AuthService)
export class Equipment {

    constructor(equipmentApi, eventAggregator, dialogService, authService) {
        this.api = equipmentApi;
        this.ea = eventAggregator;
        this.dialog = dialogService;
        this.auth = authService;

        this.auth.getMe().then(response => {
            this.me = response;
            this.isStaff = this.me.groups.indexOf('staff') > -1;
        });

        this.events = [];
        this.reservation = {};

        this.newReservation = false;
        this.showReservation = (event, jsEvent, view) => {
            this.newReservation = true;
            this.reservation = event;
        }

        this.config = {
            timezone: 'local',
            editable: false,
            header: {
                left: 'agendaWeek agendaDay month',
                right: 'today prev,next'
            },
            aspectRatio: 2,
            timeFormat: 'HH:mm',
            defaultView: 'agendaWeek',
            views: {
                agendaWeek: {
                    columnFormat: 'ddd D/M',
                },
                agenda: {
                    allDaySlot: false,
                    minTime: '07:00:00',
                    maxTime: '21:00:00',
                    slotLabelFormat: 'HH:mm',
                    slotEventOverlap: false,
                }
            },
            eventClick: this.showReservation,
            eventRender: function(event, element) {
                let now = moment.tz([], moment.tz.guess());
                let past = event.end < now;

                $(element).addClass('reservation');

                if (past) {
                    $(element).addClass('past');
                }

                if(event.is_confirmed && !past && !event.checked_in) {
                    $(element).addClass('confirmed');
                }

                if(event.is_confirmed &&
                    !event.checked_in &&
                    past) {
                    $(element).addClass('missed');
                }

                if(event.checked_in) {
                    $(element).addClass('checked_in');
                }
                /*
                let source = this.events.find(x => {
                    x.equipmentName === event.source.equipmentName });

                if (source.visible == false) {
                    $(element).hide();
                }
                */
            }
        }

        this.colours = ['#f44336', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#e91e63', '#9c27b0', '#ef9a9a', '#b39ddb', '#9fa8da', '#90caf9', '#81d4fa', '#80deea', '#80cbc4', '#a5d6a7', '#c5e1a5', '#e6ee9c', '#fff59d', '#ffe082', '#ffcc80', '#ffab91', '#f48fb1', '#ce93d8'];

        this.isLoading = true;

        this.statuses = new Map([
            ['idle', {display: 'Idle', icon: 'check', colour: 'green'}],
            ['active', {display: 'Active', icon: 'hourglass half', colour: 'blue'}],
            ['error', {display: 'Error', icon: 'warning', colour: 'red'}],
            ['broken', {display: 'Out of order', icon: 'remove', colour: 'grey'}],
        ]);

    }

    attached() {
        this.refetchSubscriber = this.ea.subscribe('refetch-events',
                                                   response => this.getEquipment());
        this.getEquipment();
        this.api.equipment({can_reserve: 'True'}).then(data => {
            for (let i = 0; i < data.results.length; i++) {
                let equipment = data.results[i];
                let api = this.api;
                let source = {
                    equipmentName: equipment.name,
                    visible: true,
                    events: function(start, end, timezone, callback) {
                        let format = 'YYYY-MM-DD[T]HH:mm:ssZZ';
                        let params = {
                            start__gte: start.subtract(12, 'hours').format(format),
                            end__lte: end.add(12, 'hours').format(format),
                            equipment_reserved: equipment.id,
                        }
                        api.reservations(params).then(response => {
                            callback(response.results);
                        }).catch(err => this.error = err);
                    },
                    overlap: false,
                    color: this.getColour(i),
                }
                this.events.push(source);
            }
            this.isLoading = false;
        }).catch(err => this.error = err);
    }

    detatch() {
        this.refetchSubscriber.dispose();
    }

    getEquipment() {
        this.api.equipment().then(data => {
            this.equipment = data;
            this.isLoading = false;
        });
    }

    setStatus(equipmentId, event) {
        let data = {
            status: event.target.value
        };
        this.api.updateEquipment(equipmentId, data).then(response => {
        });
    }

    changeLuminance(hex, lum) {
	    let rgb = "#", c, i;
	    for (let i = 0; i < 3; i++) {
		    c = parseInt(hex.substr(i*2,2), 16);
		    c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
		    rgb += ("00"+c).substr(c.length);
	    }
	    return rgb;
    }

    getColour(index) {
        if (index < this.colours.length) {
            return this.colours[index];
        } else {
            let colourPick = Math.ceil(this.colours.length / index);
            return this.changeLuminance(colourPick, 0.25);
        }
    }
}
