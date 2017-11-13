import { bindable, inject, bindingMode, NewInstance } from 'aurelia-framework';
import { UserApi } from './api';
import { DialogController } from 'aurelia-dialog';
import { ValidationController, ValidationRules, validateTrigger } from 'aurelia-validation';
import { UiValidationRenderer } from '../components/semantic-ui/ui-validation-renderer';

@inject(Element, DialogController, UserApi, NewInstance.of(ValidationController))
export class Account {

    constructor(element, dialogController, userApi, validationController) {
        this.dialog = dialogController;
        this.api = userApi;

        this.validator = validationController;
        this.validator.validateTrigger = validateTrigger.changeOrBlur;
        this.validator.addRenderer(new UiValidationRenderer());

        this.rules = ValidationRules
            .ensure('institution_name').required()
            .ensure('address_1').required()
            .ensure('city').required()
            .ensure('postcode').required()
            .ensure('country').required()
            .rules;
    }

    activate(model) {
        this.user = model;
        // Still need to validate -> each address
    }

    addAddress() {
        let address = {};
        this.validator.addObject(address, this.rules);
        this.user.addresses.push(address);
    }

    removeAddress(index) {
        this.user.addresses.splice(index, 1);
        if (this.user.addresses[index].id) {
            this.api.deleteAddress(this.user.addresses[index].id)
                .catch(err => this.error = err);
        }
    }

    save(data) {
        this.validator.validate().then(results => {
            console.log(results);
            if (results.valid) {
                if (data.id) {
                    this.api.updateAddress(data.id, data).catch(err => this.error = err);
                } else {
                    this.api.saveAddress(data).catch(err => this.error = err);
                }
            }
        });
    }

}
