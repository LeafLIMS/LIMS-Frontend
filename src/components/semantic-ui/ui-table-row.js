import {inject, bindable} from 'aurelia-framework';
import {Router} from 'aurelia-router';

@inject(Element, Router)
export class UiTableRowCustomAttribute {
    @bindable route;
    @bindable params;

    constructor(element, router) {
        this.element = element;
        this.router = router;
        this.handler = e => {
            if (e.target.nodeName == 'TD') {
                this.router.navigateToRoute(this.route, this.params);
            }
        }
    }

    attached() {
        this.element.addEventListener('click', this.handler);
    }

    detached() {
        this.element.removeEventListener('click', this.handler);
    }

    routeChanged(n, o) {
        this.route = n;
    }

    paramsChanged(n, o) {
        this.params = n;
    }

}
