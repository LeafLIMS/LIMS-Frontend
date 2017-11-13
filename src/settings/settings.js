import { inject, NewInstance, BindingEngine } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(EventAggregator, Router, BindingEngine)
export class Settings {

    constructor(eventAggregator, router, bindingEngine) {
        this.ea = eventAggregator;
        this.router = router;
        this.be = bindingEngine;

        this.isLoading = true;

        this.activeSection = undefined;
        this.activeModule = undefined;

        this.sectionChanged = x => {
            this.activateSection(this.router.currentInstruction.config.settings.childRoutes[0]);
        }

    }

    attached() {
        if (!this.activeSection) {
            this.activateSection(this.router.currentInstruction.config.settings.childRoutes[0]);
        }
        this.routerObserver = this.be.propertyObserver(this.router, 'currentInstruction')
                                .subscribe(this.sectionChanged);
    }

    detached() {
        this.routerObserver.dispose();
    }

    activateSection(section) {
        this.activeSection = section.name;
        this.activeModule = section.moduleId;
    }
}
