export class Inventory {

    configureRouter(config, router) {
        config.map(routes);
        this.router = router;
    };

}

export let routes = [
    { route: '', moduleId: './inventory', nav: false },
    { route: '/404', moduleId: './not-found', nav: false , name: 'itemNotFound'},
    { route: '/:id', name: 'inventoryDetail', moduleId: './inventory-detail', nav: false },
    { route: '/transfers/', name: 'allTransfers', moduleId: './transfers',
      nav: false },
    { route: '/transfers/:barcode', name: 'transferDetail', moduleId: './transfer-detail',
      nav: false }
];
