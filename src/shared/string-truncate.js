export class TruncateValueConverter {
    toView(value, length = 10) {
        if (value) {
            return value.length > length ? value.substring(0, length) + '...' : value;
        } else {
            return value;
        }
    }
}
