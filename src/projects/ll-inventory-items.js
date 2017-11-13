import { bindable, inject, bindingMode } from 'aurelia-framework';
import { ProjectApi } from './api';
import { DialogService } from 'aurelia-dialog';
import { UiPickerDialog } from '../components/semantic-ui/ui-picker-dialog';

@inject(DialogService, ProjectApi)
export class LlInventoryItems {
    @bindable({defaultBindingMode: bindingMode.twoWay}) source;
    @bindable sourceId;

    constructor(dialogService, projectApi) {
        this.dialog = dialogService;
        this.api = projectApi;
    }

    addItem() {
        let config = {
            title: 'Select inventory items',
            lookup: 'inventory',
            displayName: 'name',
            displayOther: ['item_type', 'identifier', 'barcode'],
        }
        this.dialog.open({viewModel: UiPickerDialog, model: config, lock: true})
            .whenClosed(response => {
            console.log(response);
            Array.prototype.push.apply(this.source, response.output);
        });
    }

    removeItem(index) {
        this.source.splice(index, 1);
    }
}
