import 'semantic-ui'

import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import AppRouterConfig from 'router-config';

@inject(Router, AppRouterConfig)
export class App {
    constructor(router, appRouterConfig) {
        this.router = router;
        this.appRouterConfig = appRouterConfig;
    }

    activate() {
        this.appRouterConfig.configure();
    }
}
