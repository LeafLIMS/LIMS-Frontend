import {AuthenticateStep} from 'aurelia-authentication';
import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {RouteMapper} from 'aurelia-route-mapper';

import { routes as projectsRoutes } from 'projects/index';
import { routes as inventoryRoutes } from 'inventory/index';
import { routes as workflowRoutes } from 'workflows/index';
import { routes as equipmentRoutes } from 'equipment/index';
import { routes as settingsRoutes } from 'settings/index';

@inject(Router, RouteMapper)
export default class {

    constructor(router, routeMapper) {
        this.router = router;
        this.routeMapper = routeMapper;
    };

    configure() {

        let routes = [
            { route: ['', '/dashboard'], name: 'dashboard', moduleId: './dashboard/dashboard',
              settings: {icon: 'dashboard'},
              nav: true, title: 'Dashboard', auth: true },
            // Authentication routes
            { route: '/login', name: 'login', moduleId: './auth/login', nav: false,
              title: 'Login', authRoute: true },
            //{ route: '/account', name: 'account', moduleId: './auth/account', nav: false,
            //  title: 'Account details', auth: true },
            // Projects routes
            { route: '/projects', name: 'project', moduleId: './projects/index', nav: true,
                settings: {icon: 'book', childRoutes: projectsRoutes},
              title: 'Projects', auth: true },
            // Inventory
            { route: '/inventory', name: 'inventory', moduleId: './inventory/index',
                settings: {icon: 'cubes', childRoutes: inventoryRoutes},
              nav: true, title: 'Inventory', auth: true },
            // Workflows
            { route: '/workflow', name: 'workflows', moduleId: './workflows/index',
                settings: {icon: 'fork', childRoutes: workflowRoutes},
              nav: true, title: 'Workflows', auth: true },
            // Equipment
            { route: '/equipment', name: 'equipment', moduleId: './equipment/index',
                settings: {icon: 'plug', childRoutes: equipmentRoutes},
              nav: true, title: 'Equipment', auth: true },
            // Settings
            { route: '/settings', name: 'settings', moduleId: './settings/index',
                settings: {icon: 'settings', admin: true, childRoutes: settingsRoutes},
              nav: true, title: 'Settings', auth: true }
        ];

        var appRouterConfig = function(config) {

            config.title = 'Leaf LIMS';

            //config.options.pushState = true;
            //config.options.hashChange = false;
            //config.options.root = '/';

            config.addPipelineStep('authorize', AuthenticateStep);
            config.map(routes);

            config.mapUnknownRoutes({moduleId: 'not-found', nav: true, auth: true});

        };

        this.router.configure(appRouterConfig);
        this.routeMapper.map(routes);
    };
}
