import { inject, bindable, bindingMode } from 'aurelia-framework';

@inject(Element)
export class ShowRowCustomAttribute {

    constructor(element) {
        this.element = element;

        this.toggle = event => {
            if (event.target.nodeName == 'TD') {
                if (this.value) {
                    this.value = false;
                } else {
                    this.value = true;
                }
            }
        }
        this.element.classList.add('clickable');
    }

    attached() {
        this.element.addEventListener('click', this.toggle);
    }

    detached() {
        this.element.removeEventListener('click', this.toggle);
    }

    valueChanged(n) {
    }
}
