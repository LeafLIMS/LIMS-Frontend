export class QueryStore {
    constructor() {
        this.storage = window.sessionStorage;
    }

    getQuery(key, initialData) {
        let query = undefined;
        if (!this.loadQuery(key)) {
            query = initialData;
        } else {
            query = this.loadQuery(key);
        }
        return query
    }

    storeQuery(key, data) {
        this.storage.setItem(key, JSON.stringify(data));
    }

    loadQuery(key) {
        return JSON.parse(this.storage.getItem(key) || false);
    }

    clearQuery(key) {
        this.storage.removeItem(key);
    }
}
