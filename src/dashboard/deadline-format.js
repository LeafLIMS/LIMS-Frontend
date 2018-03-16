import moment from 'moment';

export class DeadlineFormatValueConverter {
    toView(value) {
        if (value) {
            let deadline = moment(value);
            let today = moment();
            let daysToDeadline = deadline.diff(today, 'days');
            if (daysToDeadline < 0) {
                daysToDeadline = Math.abs(daysToDeadline);
                return `(${daysToDeadline} days overdue)`;
            } else {
                return `(${daysToDeadline} days remaning)`;
            }
        }
    }
}
