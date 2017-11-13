import { inject, NewInstance } from 'aurelia-framework';
import { DialogController } from 'aurelia-dialog';
import { ValidationRules, ValidationController, validateTrigger } from 'aurelia-validation';
import { UiValidationRenderer } from '../../components/semantic-ui/ui-validation-renderer';

@inject(Element, DialogController, NewInstance.of(ValidationController))
export class ChangePassword {

    constructor(element, dialogController, validationController) {
        this.dialog = dialogController;

        this.validator = validationController;
        this.validator.validateTrigger = validateTrigger.changeOrBlur;
        this.validator.addRenderer(new UiValidationRenderer());

        this.p = {};

        ValidationRules
            .ensure('newPassword')
            .required()
            .minLength(10)
            .satisfies((v, obj) => v === obj.repeatNewPassword)
            .ensure('repeatNewPassword')
            .required()
            .minLength(10)
            .satisfies((v, obj) => v === obj.newPassword)
            .on(this.p)
    }

    activate(user) {
        this.user = user;
    }

    change() {
        this.validator.validate().then(results => {
            this.dialog.ok(this.p);
        });
    }
}
