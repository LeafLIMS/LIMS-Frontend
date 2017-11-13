export class UiTableCustomAttribute {
    static inject = [Element];

    constructor(element) {
        this.element = element;
        let classes = ' ui selectable sortable striped unstackable table attached ';
        this.element.className += classes;
    }
}
