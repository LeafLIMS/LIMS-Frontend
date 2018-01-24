import { inject, NewInstance } from 'aurelia-framework';
import { ProjectApi } from './api';
import { DialogService } from 'aurelia-dialog';
import { HistoryDialog } from './history-dialog';

@inject(ProjectApi, DialogService)
export class ProductHistory {

    constructor(projectApi, dialogService) {
        this.api = projectApi;
        this.dialog = dialogService;
    }

    activate(params, routeMap) {
        this.api.projectDetail(params.id).then(data => {
            this.project = data;
            this.getProducts();
        });
    }

    getProducts() {
        this.api.productsForProject(this.project.id, {with_data: 'True'}).then(data => {
            this.products = data;
            this.isLoading = false;
        });
    }

    showData(data) {
        console.log(data);
        this.dialog.open({viewModel: HistoryDialog, model: data}).whenClosed(response => {
            if (!response.wasCancelled) {
            }
        });
    }
}
