import {inject} from 'aurelia-framework';
import {Config} from 'aurelia-api';
import {AuthService} from 'aurelia-authentication';

@inject(Config, AuthService)
export class UserApi {

    constructor(config, authService) {
        this.endpoint = config.getEndpoint('api');
        this.auth = authService;
    }

    users(params) {
        return this.endpoint.find('users/', params);
    }

    userDetail(id, params) {
        return this.endpoint.findOne('users/', id, params);
    }

    createUser(data) {
        return this.endpoint.create('users/', data);
    }

    updateUser(id, data) {
        return this.endpoint.patchOne('users/', id, null, data);
    }

    deleteUser(id) {
        return this.endpoint.destroyOne('users/', id);
    }

    currentUser() {
        let tokenData = this.auth.getTokenPayload();
        return this.endpoint.findOne('users/', tokenData.user_id);
    }

    changePassword(userId, password) {
        let path = `users/${userId}/change_password/`;
        return this.endpoint.patch(path, null, {new_password: password});
    }

    groups(params) {
        return this.endpoint.find('groups/', params);
    }

    createGroup(data) {
        return this.endpoint.create('groups/', data);
    }

    updateGroup(id, data) {
        return this.endpoint.patchOne('groups/', id, null, data);
    }

    deleteGroup(id) {
        return this.endpoint.destroyOne('groups/', id);
    }

    setPermissions(object, id, permissions) {
        return this.endpoint.patchOne(object, id, 'set_permissions/', permissions);
    }

    removePermissions(object, id, groupList) {
        return this.endpoint.destroyOne(object, id, 'remove_permissions/?groups=' + groupList);
    }

    saveAddress(data) {
        return this.endpoint.create('addresses/', data);
    }

    updateAddress(id, data) {
        return this.endpoint.patchOne('addresses/', id, null, data);
    }

    deleteAddress(id) {
        return this.endpoint.destroyOne('addresses/', id);
    }

}
