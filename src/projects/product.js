import { inject, bindable, bindingMode, BindingEngine, NewInstance } from 'aurelia-framework';
import { ProjectApi } from './api';
import { InventoryApi } from '../inventory/api';
import { RouteMapper } from "aurelia-route-mapper";
import { ValidationRules, ValidationController, validateTrigger } from 'aurelia-validation';
import { UiValidationRenderer } from '../components/semantic-ui/ui-validation-renderer';

@inject(ProjectApi, InventoryApi, BindingEngine, RouteMapper, NewInstance.of(ValidationController))
export class ProductCustomElement {
    @bindable productId;
    @bindable({defaultBindingMode: bindingMode.twoWay}) toggle;

    constructor(projectApi, inventoryApi, bindingEngine, routeMapper, validationController) {
        this.api = projectApi;
        this.bindingEngine = bindingEngine;
        this.inventoryApi = inventoryApi;
        this.mapper = routeMapper;

        this.validator = validationController;
        this.validator.validateTrigger = validateTrigger.changeOrBlur;
        this.validator.addRenderer(new UiValidationRenderer());

        this.product = {};
        this.isSaving = false;

        ValidationRules
            .ensure('name').required()
            .ensure('status').required()
            .ensure('product_type').required()
            .on(this.product);

        this.inventoryApi.itemTypes().then(data => {
            this.itemTypes = data;
        });

        this.api.productStatuses().then(data => {
            this.productStatuses = data;
        });
    }

    attached() {
        this.api.productDetail(this.productId).then(data => {
            this.product = data;
            console.log('INIT PRODUCT PROPERTIES', this.product.properties);
            if (!this.product.properties) {
                this.product.properties = {};
            }
            console.log('POST PRODUCT PROPERTIES', this.product.properties);
        });
    }

    save() {
        this.validator.validate().then(results => {
            if (results.valid) {
                console.log('PRODUCT PROPERTIES', this.product);
                this.isSaving = true;
                // Pre-process some of the data to ensure it is correct
                let productUpdate = {};
                Object.assign(productUpdate, this.product);
                //jQuery.extend(productUpdate, this.product);

                // Convert linked inventory to a list of id's
                let linkedInventory = [];
                for (let item of productUpdate.linked_inventory) {
                    linkedInventory.push(item.id);
                }
                productUpdate.linked_inventory = linkedInventory;

                // Convert attachments to a list of IDs as well
                let attachments = [];
                for (let item of productUpdate.attachments) {
                    attachments.push(item.id);
                }
                productUpdate.attachments = attachments;

                productUpdate.properties = this.product.properties;

                // Then update using local version
                this.api.updateProduct(this.product.id, productUpdate).then(data => {
                    this.isSaving = false;
                }).catch(err => {
                    this.isSaving = false;
                    this.error = err;
                });
            }
        });
    }

    cancel() {
        this.toggle = false;
    }
}
