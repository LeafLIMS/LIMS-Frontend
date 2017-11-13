import { inject, bindable } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { EventAggregator } from 'aurelia-event-aggregator';
import { BindingEngine } from 'aurelia-framework';

@inject(Router, EventAggregator, BindingEngine)
export class Subsection {

    constructor(router, eventAggregator, bindingEngine) {
        this.router = router;
        this.ea = eventAggregator;
        this.be = bindingEngine;

        this.subsectionChanged = (n, o) => {
            if (n && this.subsections.has(this.data.subsection)) {
                console.log(this.subsections, this.data.subsection);
                this.template = this.subsections.get(this.data.subsection).template;
                this.subsection = `./${this.data.section}/${this.data.subsection}`;
            }
        }

        this.routes = [];

    }
    /*
        this.routes.push({route: '', redirect: this.defaultSubsection});
        for (let [s, n] of this.subsections) {
            this.routes.push({route: `${this.section}/${s}`, name: `${s}-sub-settings`,
                              layoutView: './table.html',
                              moduleId: `./${s}`, nav: false });
        }
        console.log(this.routes);
        config.map(this.routes);
        this.router = router;
    };
    */

    activate(params, routerConfig, model) {
        this.data = model;
        console.log("DT", params, routerConfig, model);
        /*
        if (!this.data.subsection) {
            this.router.navigateToRoute('section', {section: this.data.section,
                                                    subsection: this.defaultSubsection});
        }
        */
    }

    /*
    attached() {
        this.subsectionWatcher = this.be.propertyObserver(this.data, 'subsection')
                                        .subscribe(this.subsectionChanged);
        this.subsectionChanged(this.data.subsection);
    }

    detached() {
        this.subsectionWatcher.dispose();
    }
    */

    /*
    getSection() {
        console.log('SECTION', this.data);
        console.log('SECTION SUBSECTION', this.subsections);
        if (!this.data.subsection) {
            this.router.navigateToRoute('section', {section: this.data.section,
                                                    subsection: this.defaultSubsection});
        }
        if (this.data.subsection && this.subsections.has(this.data.subsection)) {
            this.template = this.subsections.get(this.data.subsection).template;
            this.subsection = `./${this.data.section}/${this.data.subsection}`;
        }
    }

    detached() {
        this.sectionSubscriber.dispose();
    }
    */
}
