export class ExcludeTypeValueConverter {
    toView(valuesArray, acceptArray) {
        if (valuesArray && acceptArray) {
            return valuesArray.filter(x => {
                return acceptArray.indexOf(x.item_type) !== -1;
            });
        }
        return valuesArray ? valuesArray : [];
    }
}
