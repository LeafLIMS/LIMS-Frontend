import {AuthService} from 'aurelia-authentication';
import {inject} from 'aurelia-framework';

@inject(AuthService)
export class Login {

    heading = 'Login';

    username = '';
    password = '';

    loginError = '';

    constructor(auth) {
        this.auth = auth;
    };

    login() {
        var loginDetails = {
            username: this.username,
            password: this.password,
        }
        return this.auth.login(loginDetails)
        .catch(error => {
            this.loginError = error.response;
        });
    };
}
