export class Equipment {

    configureRouter(config, router) {
        config.map(routes);
        this.router = router;
    };

}

export let routes = [
    { route: ['', '/:id'], moduleId: './equipment', nav: false },
];
