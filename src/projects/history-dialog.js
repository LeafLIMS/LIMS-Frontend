import { bindable, inject, bindingMode } from 'aurelia-framework';
import { DialogController } from 'aurelia-dialog';

@inject(DialogController)
export class HistoryDialog {
    constructor(dialogController) {
        this.dialog = dialogController;
    }

    activate(dataEntry) {
        this.data = dataEntry;
    }
}
