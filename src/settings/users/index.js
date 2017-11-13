export let routes = [
    { route: '/users', name: 'user-settings', moduleId: './users/users',
      nav: false, title: 'Users', layoutView: './table.html' },
    { route: '/groups', name: 'group-settings', moduleId: './users/groups',
      nav: false, title: 'Groups', layoutView: './table.html' },
];
