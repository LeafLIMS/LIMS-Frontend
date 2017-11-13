export let routes = [
    { route: '/workflows', name: 'workflows-settings', moduleId: './workflows/workflows',
      nav: false, title: 'Workflow templates', layoutView: './table.html' },
    { route: '/tasks', name: 'tasks-settings', moduleId: './workflows/tasks',
      nav: false, title: 'Task templates', layoutView: './table.html' },
];
