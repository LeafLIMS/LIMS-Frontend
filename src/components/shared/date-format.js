import moment from 'moment';

export class DateFormatValueConverter {
    toView(value, format) {
        if (!format) {
            format = 'DD/MM/YY h:mm:ss a'
        }
        return moment(value).format(format);
    }
}
