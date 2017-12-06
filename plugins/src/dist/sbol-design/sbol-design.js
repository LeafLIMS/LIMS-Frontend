import { inject, bindable, bindingMode, BindingEngine } from 'aurelia-framework';

@inject(BindingEngine)
export class SbolDesign {
    properties_src = 'll_sbol';

    constructor(bindingEngine) {
        this.be = bindingEngine;
    }

    activate(model) {
        this.model = model;
        if (!this.model.properties[this.properties_src]) {
            this.model.properties[this.properties_src] = {};
        }
        this.data = this.model.properties[this.properties_src];
    }

    updateDesign(event) {
        let fileToRead = event.originalTarget.files[0];
        let name = fileToRead.name.split('.');
        let ext = name[name.length-1].toLowerCase();
        if (ext == 'sbol') {
            this.data.design_file_extension = 'csv';
        } else if (['gb', 'genbank', 'gen'].indexOf(ext) !== -1) {
            this.data.design_file_extension = 'gb';
        } else {
            this.data.design_file_extension = 'csv';
        }
        let reader = new FileReader();
        reader.onload = fileData => {
            this.data.design_file = fileData.target.result;
        }
        reader.readAsText(fileToRead);
    }
}
