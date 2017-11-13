import { bindable, inject, bindingMode } from 'aurelia-framework';
import { ProjectApi } from './api';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(ProjectApi)
export class LlProductAttachments {
    @bindable({defaultBindingMode: bindingMode.twoWay}) source;
    @bindable sourceId;

    constructor(projectApi) {
        this.api = projectApi;
        this.attachmentFile = null;
        this.error = null;
    }

    addAttachment() {
        if (this.attachmentFile) {
            let data = new FormData();
            data.append('attachment', this.attachmentFile[0]);
            this.api.addAttachment(this.sourceId, data).then(data => {
                data.json().then(response => {
                    data.body = response;
                    this.source.push(response);
                    this.addNew = false;
                    this.attachmentFile = null;
                }).catch(err => {
                    this.error = data;
                });
            }).catch(err => {
                this.error = err;
            });
        } else {
            this.message = 'Please select a file to attach.';
        }
    }

    removeAttachment(index, item) {
        this.api.removeAttachment(this.sourceId, item.id).then(data => {
            data.json().then(response => {
                this.source.splice(index, 1);
            }).catch(err => {
                this.error = data;
            });
        }).catch(err => {
            this.error = err;
        });
    }
}
