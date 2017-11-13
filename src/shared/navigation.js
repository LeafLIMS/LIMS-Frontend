import {bindable} from 'aurelia-framework';
import {inject} from 'aurelia-framework';
import {AuthService} from 'aurelia-authentication';
import { EventAggregator } from 'aurelia-event-aggregator';
import { UserApi } from '../auth/api';
import { AlertApi } from '../alerts/api';
import { DialogService } from 'aurelia-dialog';
import { Account } from '../auth/account';
import { ChangePassword } from '../settings/users/change-password';

@inject(AuthService, EventAggregator, UserApi, AlertApi, DialogService)
export class Navigation {
    // User isn't authenticated by default
    _isAuthenticated = false;
    isAdmin = false;
    @bindable router = null;
    @bindable accountPane;

    constructor(auth, eventAggregator, userApi, alertApi, dialogService) {
        this.auth = auth;
        this.api = userApi;
        this.alertApi = alertApi;
        this.ea = eventAggregator;
        this.dialog = dialogService;
        this.payload = this.auth.getTokenPayload();
    };

    attached() {
        this.accountPaneClickWatcher = window.addEventListener('click', event => {
            // Hide the pane if anything else but pane stuff is clicked
            if (this.accountPane &&
                !this.hasParentClass(event.target, 'user-details') &&
                !event.target.classList.contains('user-details') &&
                !event.target.classList.contains('account-pane') &&
                !this.hasParentClass(event.target, 'account-pane')) {
                this.accountPane = false;
            }
        });
        this.ea.subscribe('authentication-change', authenticated => {
            if (authenticated) {
                this.payload = this.auth.getTokenPayload();
                this.setMe();
            }
        });
        this.setMe();
    }

    detached() {
        this.accountPaneClickWatcher.dispose();
    }

    hasParentClass(el, cls) {
        while ((el = el.parentElement) && !el.classList.contains(cls));
        return el;
    }

    accountPaneChanged(n) {
        if (n) {
            this.getAlerts();
        }
    }

    getAlerts() {
        let params = {user__username: this.payload.username};
        this.alertApi.alerts(params).then(data => {
            this.alerts = data;
        });
    }

    showAccountDialog() {
        this.dialog.open({viewModel: Account, model: this.me}).whenClosed(response => {
            console.log('closed yay!');
        });
    }

    showPasswordDialog() {
        this.dialog.open({viewModel: ChangePassword, model: this.me}).whenClosed(response => {
            this.api.changePassword(this.me.id, response.output.newPassword)
                .catch(err => this.error = err);
        });
    }

    dismissAlert(alert) {
        this.alertApi.updateAlert(alert.id).then(data => {
            this.getAlerts();
        }).catch(err => this.errors = err);
    }

    setMe() {
        if (this.payload) {
            this.auth.getMe().then(data => {
                this.me = data;
                this.isAdmin = this.me.groups.indexOf('admin') > -1;
            });
        }
    }

    toggleAccountPane() {
        if (this.accountPane) {
            this.accountPane = false;
        } else {
            this.accountPane = true;
        }
    }

    // We can check if the user is authenticated
    // to conditionally hide or show nav bar items
    get isAuthenticated() {
      return this.auth.isAuthenticated();
    };

    logout() {
        this.auth.logout();
        this.payload = undefined;
        this.me = undefined;
        this.accountPane = false;
        this.alerts = [];
    }
}
