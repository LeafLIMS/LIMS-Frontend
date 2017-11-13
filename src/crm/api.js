import {inject} from 'aurelia-framework';
import {Config} from 'aurelia-api';

@inject(Config)
export class CrmApi {

    constructor(config) {
        this.endpoint = config.getEndpoint('api');
    }

    crmProjects(params) {
        return this.endpoint.find('crm/project/', params);
    }

    associateCRMProject(projectId, crmProjectId) {
        return this.endpoint.post('crm/link/', {id: projectId, identifier: crmProjectId});
    }

    disassociateCRMProject(projectId, crmProjectId) {
    }

    addAccount(emailAddress) {
        return this.endpoint.post('crm/user/', {email: emailAddress, add_only: 'True'});
    }

    removeAccount(emailAddress) {
        return this.endpoint.destroy('crm/user/', {email: emailAddress});
    }

}
