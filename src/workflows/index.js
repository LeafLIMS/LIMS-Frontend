export class Workflows {

    configureRouter(config, router) {
        config.map(routes);
        this.router = router;
    };

}

export let routes = [
    { route: ['', '/:id'], moduleId: './workflows', nav: false },
    { route: '/:id/start', name: 'startTask', moduleId: './start-task', nav: false },
    { route: '/:id/perform', name: 'performTask', moduleId: './perform-task', nav: false },
    { route: '/:id/finish', name: 'finishTask', moduleId: './finish-task', nav: false },
];
