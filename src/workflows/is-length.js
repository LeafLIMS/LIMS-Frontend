export class IsLengthValueConverter {
    toView(valuesArray, value) {
        return valuesArray.length == value;
    }
}
