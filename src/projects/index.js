export class Project {

    configureRouter(config, router) {
        config.map(routes);
        this.router = router;
    };

}

export let routes = [
    { route: '', moduleId: './projects', nav: false },
    { route: '/:id', name: 'projectDetail', moduleId: './project-detail', nav: false },
    { route: '/:id/history', name: 'productHistory', moduleId: './product-history', nav: false }
];
