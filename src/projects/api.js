import {inject} from 'aurelia-framework';
import {Config} from 'aurelia-api';

@inject(Config)
export class ProjectApi {

    constructor(config) {
        this.endpoint = config.getEndpoint('api');
    }

    projects(params) {
        return this.endpoint.find('projects/', params);
    }

    projectDetail(id, params) {
        return this.endpoint.findOne('projects/', id);
    }

    createProject(data) {
        return this.endpoint.create('projects/', data);
    }

    updateProject(id, data) {
        return this.endpoint.patchOne('projects/', id, null, data);
    }

    deleteProject(id) {
        return this.endpoint.destroyOne('projects/', id);
    }

    productsForProject(id, params) {
        params.project = id;
        return this.endpoint.find('products/', params);
    }

    productDetail(id, params) {
        return this.endpoint.findOne('products/', id);
    }

    saveProduct(projectId, data) {
        data.project = projectId;
        return this.endpoint.create('products/', data);
    }

    updateProduct(id, data) {
        return this.endpoint.patchOne('products/', id, null, data);
    }

    addAttachment(productId, data) {
        let path = `products/${productId}/add_attachment/`;
        return this.endpoint.client.fetch(path, {
            method: 'post',
            body: data
        });
    }

    removeAttachment(productId, attachmentId) {
        let path = `products/${productId}/delete_attachment/?id=${attachmentId}`;
        return this.endpoint.client.fetch(path, {
            method: 'delete',
        });
    }

    importProducts(projectId, data) {
        let path = `projects/${projectId}/import_products/`;
        return this.endpoint.client.fetch(path, {
            method: 'post',
            body: data
        });
    }

    // Product statuses
    productStatuses(params) {
        return this.endpoint.find('productstatuses/', params);
    }

    createProductStatus(data) {
        return this.endpoint.create('productstatuses/', data);
    }

    updateProductStatus(id, data) {
        return this.endpoint.patchOne('productstatuses/', id, null, data);
    }

    deleteProductStatus(id) {
        return this.endpoint.destroyOne('productstatuses/', id);
    }

    // Project statuses
    projectStatuses(params) {
        return this.endpoint.find('projectstatuses/', params);
    }

    createProjectStatus(data) {
        return this.endpoint.create('projectstatuses/', data);
    }

    updateProjectStatus(id, data) {
        return this.endpoint.patchOne('projectstatuses/', id, null, data);
    }

    deleteProjectStatus(id) {
        return this.endpoint.destroyOne('projectstatuses/', id);
    }
}
