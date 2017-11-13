import { inject, bindable, bindingMode } from 'aurelia-framework';
import { AureliaConfiguration } from 'aurelia-configuration';

@inject(AureliaConfiguration)
export class LlTemplateHookCustomElement {
    @bindable name;
    @bindable({ defaultBindingMode: bindingMode.twoWay }) source;

    constructor(aureliaConfiguration) {
        this.config = aureliaConfiguration;

        this.availablePlugins = this.config.get('plugins', {});
    }

    attached() {
        let plugins = [];
        if (this.name in this.availablePlugins) {
            for (let plugin of this.availablePlugins[this.name]) {
                plugins.push('../../' + plugin);
            }
        }
        this.plugins = plugins;
        console.log(this.plugins);
    }
}
