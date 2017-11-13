export class LimitLengthValueConverter {
    toView(value, length) {
        let output = value;
        if (!length) {
            length = 300;
        }
        if (value && value.length > length) {
            output = value.slice(0, length) + '\u2026'
        }
        return output;
    }
}
