import { inject } from 'aurelia-framework';
import { StatsApi } from './api';

import { ProjectApi } from '../projects/api';
import { WorkflowApi } from '../workflows/api';
import { InventoryApi } from '../inventory/api';
import { EquipmentApi } from '../equipment/api';

@inject(StatsApi, ProjectApi, WorkflowApi, InventoryApi, EquipmentApi)
export class Dashboard {

    constructor(statsApi, projectApi, workflowApi, inventoryApi, equipmentApi) {
        this.api = statsApi;
        this.projectApi = projectApi;
        this.workflowApi = workflowApi;
        this.inventoryApi = inventoryApi;
        this.equipmentApi = equipmentApi;

        this.projectApi.projects({limit: 5, ordering: '-id', archive: 'False'}).then(data => {
            this.project_count = data.meta.count;
            this.projects = data;
        });

        this.workflowApi.runs({limit: 5, ordering: '-id', is_active: 'True'}).then(data => {
            this.run_count = data.meta.count;
            this.runs = data;
        });

        this.inventoryApi.inventory({limit: 5, ordering: '-id', in_inventory: 'True'})
            .then(data => {
            this.inventory_count = data.meta.count;
            this.inventory = data;
        });

        this.api.stats('projects', 'status__name', 'archive').then(data => {
            this.project_statuses = this.makeDataset('status__name', data);
        });

        this.api.stats('products', 'status__name', 'project__archive').then(data => {
            this.product_statuses = this.makeDataset('status__name', data);
        });

        this.api.stats('projects', 'deadline_status', 'archive').then(data => {
            this.deadlines = this.makeDataset('deadline_status', data);
        });

        this.projectApi.projects({limit: 50, ordering: 'deadline_status',
                                  'deadline_status': 'Past'}).then(data => {
            this.past_deadlines = data;
        });

        this.projectApi.projects({limit: 50, ordering: 'deadline_status',
                                  'deadline_status': 'Warn'}).then(data => {
            this.warn_deadlines = data;
        });

        this.equipmentApi.equipment({status: 'error'}).then(data => {
            this.equipment_count = data.meta.count;
        });
    }

    makeDataset(filter, data) {
        var results = {labels: [], data: []};
        for (let obj of data) {
            var toLabel, toValue;
            if (obj[filter]) {
                toLabel = obj[filter].replace(/_/g, filter);
            } else {
                toLabel = 'None';
            }
            toValue = obj[filter + '__count'];
            if (toValue > 0) {
                results.labels.push(toLabel);
                results.data.push(toValue);
            }
        };
        return results;
    };

}
