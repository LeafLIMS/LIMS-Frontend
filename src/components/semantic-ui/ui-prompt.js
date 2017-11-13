import { inject } from 'aurelia-framework';
import { DialogController } from 'aurelia-dialog';

@inject(Element, DialogController)
export class Prompt {

    constructor(element, dialogController) {
        this.dialog = dialogController;
    }

    activate(message) {
        this.message = message;
    }
}
