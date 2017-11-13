import { inject, NewInstance } from 'aurelia-framework';
//import { EquipmentApi } from './api';
import { EventAggregator } from 'aurelia-event-aggregator';
import { DialogService } from 'aurelia-dialog';
//import { Prompt } from '../components/semantic-ui/ui-prompt';

@inject(EventAggregator, DialogService)
export class General {
}
