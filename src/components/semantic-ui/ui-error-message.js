import { bindable } from 'aurelia-framework';

export class UiErrorMessageCustomElement {
    @bindable errorSource;

    errorSourceChanged() {
        if (this.errorSource) {
            this.error = {};
            this.error.status = this.errorSource.status;
            this.error.statusText = this.errorSource.statusText;
            if (this.errorSource.bodyUsed && this.errorSource.bodyUsed === false) {
                this.errorSource.json().then(response => {
                    if (response.message) {
                        this.error.message = response.message;
                    }
                })
            } else {
                if (this.errorSource.body && this.errorSource.body.message) {
                    this.error.message = this.errorSource.body.message;
                }
            }
        } else {
            this.error = null;
        }
    }
}
