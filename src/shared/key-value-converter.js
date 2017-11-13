export class KeysValueConverter {
    toView(obj) {
        return Reflect.ownKeys(obj);
    }
}
