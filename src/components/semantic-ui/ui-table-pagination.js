import { bindable, bindingMode, inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(Element, EventAggregator)
export class UiTablePaginationCustomElement {
    @bindable({ defaultBindingMode: bindingMode.twoWay }) page;
    @bindable total;
    @bindable({ defaultBindingMode: bindingMode.twoWay }) limit;
    @bindable limitOptions;

    constructor(element, eventAggregator) {
        this.element = element;
        this.ea = eventAggregator;

        this.showNext = true;
        this.showPrevious = true;

        this.setPageCount();
    }

    attached() {
        this.pageSelect = jQuery('.ui.dropdown.pagination', this.element).dropdown();
    }

    setPageCount() {
        this.pageCount = Math.ceil(this.total / this.limit);
        if (!this.pageCount || this.pageCount == 0 || this.pageCount == Infinity) {
            this.pageCount = 1;
        }

        this.pages = Array.from(Array(this.pageCount)).map((e,i)=>i+1);

        if (this.page <= 1) {
            this.showPrevious = false;
        } else {
            this.showPrevious = true;
        }

        if (this.page >= this.pageCount) {
            this.showNext = false;
        } else {
            this.showNext = true;
        }

        if (this.pageSelect) {
            this.pageSelect.dropdown('set selected', this.page);
        }
    }

    totalChanged(n) {
        this.total = n;
        this.setPageCount();
    }

    limitChanged(n) {
        this.limit = n;
        this.setPageCount();
    }

    pageChanged(n) {
        this.page = parseInt(n);
        this.setPageCount();
    }

    navigateFirst() {
        this.page = 1;
        this.ea.publish('queryChanged', {source: 'pagination', page: this.page, limit: this.limit});
    }

    navigateLast() {
        this.page = this.pageCount;
        this.ea.publish('queryChanged', {source: 'pagination', page: this.page,
                                         limit: this.limit});
    }

    navigatePrevious() {
        if ((this.page - 1) >= 1) {
            this.page = this.page - 1;
            this.ea.publish('queryChanged', {source: 'pagination', page: this.page,
                                             limit: this.limit});
        }
    }

    navigateNext() {
        if ((this.page + 1) <= this.pageCount) {
            this.page = this.page + 1;
            this.ea.publish('queryChanged', {source: 'pagination', page: this.page,
                                             limit: this.limit});
        }
    }

    gotoPage() {
        console.log(this.page);
        this.ea.publish('queryChanged', {source: 'pagination', page: this.page, limit: this.limit});
    }
}
