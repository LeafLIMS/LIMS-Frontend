export class PathWalkerValueConverter {
    toView(value, fieldPath) {
        return fieldPath.split('.').reduce((o,i)=> o[i] ? o[i] : '', value);
    }
}
