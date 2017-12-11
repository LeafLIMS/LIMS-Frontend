import { inject } from 'aurelia-framework';
import { UserApi } from '../../auth/api';
import { CrmApi } from '../../crm/api';
import { SettingsTable } from '../settings-table';
import { ValidationRules } from 'aurelia-validation';
import { ChangePassword } from './change-password';

@inject(UserApi, CrmApi)
export class Users extends SettingsTable {

    constructor(userApi, crmApi, ...rest) {
        super(...rest);

        this.api = userApi;
        this.crmApi = crmApi;

        this.setFunctions('user');
        this.createTemplate = './users/create-user.html';

        this.tableHeaders = [
            'Username',
            'Email',
            'CRM Account',
        ];
        this.tableFields = [
            'username',
            'email',
            'crmaccount.account_details',
        ];

        this.item.groups = [];

        this.changePassword = (user) => {
            this.dialog.open({viewModel: ChangePassword, model: user}).whenClosed(response => {
                this.api.changePassword(user.id, response.output.newPassword)
                .catch(err => this.error = err);
            });
        }

        this.extraButtons = [
            {icon: 'key', action: this.changePassword},
        ];

        ValidationRules
            .ensure('username')
            .satisfies((v, o) => {
                return v.match(/^[A-Za-z0-9@\-_\.\+]+$/g) ? true : false;
            })
            .satisfies((v, o) => v.includes(' ') ? false : true)
            .required()
            .ensure('password').required()
            .ensure('email').email().required()
            .on(this.item);

    }

    addAccount() {
        this.crmApi.addAccount(this.item.email).then(data => { this.getData() });
    }

    removeAccount() {
        this.crmApi.removeAccount(this.item.email).then(data => { this.getData() });
    }

    addGroup() {
        this.item.groups.push(this.group);
    }

    removeGroup(index) {
        this.item.groups.splice(index, 1);
    }
}
