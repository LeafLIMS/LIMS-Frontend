import { inject, NewInstance } from 'aurelia-framework';
import { ProjectApi } from './api';
import { EventAggregator } from 'aurelia-event-aggregator';
import { DialogService } from 'aurelia-dialog';
import { Prompt } from '../components/semantic-ui/ui-prompt';

@inject(ProjectApi, EventAggregator, DialogService)
export class Projects {

    constructor(projectApi, eventAggregator, dialogService) {
        this.api = projectApi;
        this.ea = eventAggregator;

        this.dialog = dialogService;

        this.selected = [];
        this.newProject = false;

        this.query = {
            limit: 10,
            ordering: '-identifier',
            archive: 'False',
        }

        this.getProjects();
    }

    attached() {
        this.querySubscriber = this.ea.subscribe('queryChanged', response => {
            if (response.source == 'pagination') {
                this.query.page = response.page;
                this.query.limit = response.limit;
            }
            this.getProjects();
        });

        this.isLoading = true;
    }

    detached() {
        this.querySubscriber.dispose();
    }

    getProjects() {
        this.api.projects(this.query).then(data => {
            this.projects = data;
            this.isLoading = false;
        });
    }

    deleteItems() {
        let message = 'Delete ' + this.selected.length + ' projects?';
        this.dialog.open({viewModel: Prompt, model: message}).whenClosed(response => {
            if (!response.wasCancelled) {
                let promises = []
                for (let item of this.selected) {
                    promises.push(this.api.deleteProject(item.id));
                }
                Promise.all(promises).then(response => {
                    this.getProjects();
                    this.selected.splice(0, this.selected.length);
                });
            }
        });
    }

    archiveItems() {
        let message = 'Archive ' + this.selected.length + ' projects?';
        this.dialog.open({viewModel: Prompt, model: message}).whenClosed(response => {
            if (!response.wasCancelled) {
                let promises = []
                for (let item of this.selected) {
                    item.archive = true;
                    promises.push(this.api.updateProject(item.id, item));
                }
                Promise.all(promises).then(response => {
                    this.getProjects();
                    this.selected.splice(0, this.selected.length);
                });
            }
        });
    }

}
