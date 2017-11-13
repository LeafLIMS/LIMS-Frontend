export let routes = [
    { route: '/equipment', name: 'equipment-settings', moduleId: './equipment/equipment',
      nav: false, title: 'Available equipment', layoutView: './table.html' },
    { route: '/files', name: 'files-settings', moduleId: './equipment/files',
      nav: false, title: 'Equipment file handling', layoutView: './table.html' },
];
