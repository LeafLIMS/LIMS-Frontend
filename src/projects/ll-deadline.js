import { inject, bindable } from 'aurelia-framework';
import { ProjectApi } from './api';
import moment from 'moment';

@inject(ProjectApi)
export class LlDeadline {
    @bindable projectId;
    @bindable deadline;
    @bindable deadlineStatus;
    @bindable deadlineWarn;
    @bindable extensions;
    @bindable inactive;
    @bindable warn;
    @bindable past;

    constructor(projectApi) {
        this.api = projectApi;

        this.config = {
            type: 'date',
            today: true,
        }
    }

    deadlineChanged(n) {
        if (n) {
            let deadline = moment(this.deadline);
            let today = moment();
            this.daysToDeadline = deadline.diff(today, 'days');
            if (this.daysToDeadline < 0) {
                this.daysToDeadline = Math.abs(this.daysToDeadline);
                this.deadlinePassed = true;
            } else {
                this.deadlinePassed = false;
            }
        }
    }

    setDeadline() {
        if (this.deadline && !this.deadlineStatus) {
            let data = {
                deadline: this.deadline
            }
            if (this.deadlineWarn) {
                data.deadline_warn = this.deadlineWarn;
            }
            this.api.updateProject(this.projectId, data).then(result => {
                this.deadlineStatus = result.deadline_status;
                this.warn = result.warn_deadline;
                this.past = result.past_deadline;
            });
        } else if (this.deadline && this.reason && this.deadlineStatus) {
            let data = {
                deadline: this.deadline,
                reason: this.reason,
            }
            if (this.deadlineWarn) {
                data.deadline_warn = this.deadlineWarn;
            }
            this.api.updateDeadline(this.projectId, data).then(result => {
                this.edit = false;
                this.reason = '';
                this.warn = result.warn_deadline;
                this.past = result.past_deadline;
                this.extensions = result.deadline_extensions;
                this.deadlineChanged(this.deadline);
            });
        }
    }

    save() {
    }
}
