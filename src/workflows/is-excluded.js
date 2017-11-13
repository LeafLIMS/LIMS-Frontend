export class IsExcludedValueConverter {
    toView(value, itemId) {
        let excluded = value ? value.split(',') : [];
        let sId = itemId.toString();
        if (excluded.indexOf(sId) !== -1) {
            return 'icon excluded';
        }
        return false;
    }
}
