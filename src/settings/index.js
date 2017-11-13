import { routes as generalRoutes } from './general/index';
import { routes as workflowRoutes } from './workflows/index';
import { routes as equipmentRoutes } from './equipment/index';
import { routes as userRoutes } from './users/index';
import { routes as alertRoutes } from './alerts/index';

export class Settings {

    constructor() {
    }

    configureRouter(config, router) {
        config.map(routes);
        this.router = router;
    };

}

export let routes = [
    { route: '', redirect: 'general'},
    { route: '/general', name: 'generalSettings', moduleId: './settings',
        nav: false, title: 'General', settings: { childRoutes: generalRoutes}},
    { route: '/workflows', name: 'workflowsSettings', moduleId: './settings',
      nav: false, title: 'Workflows', settings: { childRoutes: workflowRoutes}},
    { route: '/equipment', name: 'equipmentSettings', moduleId: './settings',
      nav: false, title: 'Equipment', settings: { childRoutes: equipmentRoutes}},
    { route: '/users', name: 'usersSettings', moduleId: './settings',
      nav: false, title: 'Users', settings: { childRoutes: userRoutes}},
    { route: '/alerts', name: 'alertsSettings', moduleId: './settings',
      nav: false, title: 'Alerts', settings: { childRoutes: alertRoutes}},
    //{ route: '/crm', name: 'crmSettings', moduleId: './settings',
    //    nav: false, title: 'CRM', settings: { childRoutes: generalRoutes}},
];
