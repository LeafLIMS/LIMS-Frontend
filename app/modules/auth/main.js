'use strict';

var app = angular.module('limsFrontend');

app.controller('LoginModalCtrl', function($scope, UserService, $mdDialog) {
    $scope.cancel = $mdDialog.hide;

    $scope.submit = function(username, password) {
        UserService.login(username, password).then(function(data) {
            var user = {};
            user.id = data.id;
            user.token = data.token;
            user.username = username;
            user.status = data.status;
            user.groups = data.groups;
            user.crmEnabled = data.crm;
            UserService.setUser(user)
            $mdDialog.hide(user);
        }).catch(function(error) {
            $scope.messages = error.data.message;
        });
    };
});

app.service('loginModal', function(UserService, $mdDialog, $localStorage) {

    return function() {
        delete $localStorage.user;
        $mdDialog.cancel();
        var instance = $mdDialog.show({
            templateUrl: 'modules/auth/views/loginmodal.html',
            controller: 'LoginModalCtrl',
        });
        return instance;
    }

});

app.service('UserService', function(Restangular, $localStorage) {

    this.autocomplete = function(searchText) {
        return Restangular.all('users').all('autocomplete')
            .getList({q: searchText});
    }

    this.isLoggedIn = function() {
        if (typeof $localStorage.user !== 'undefined') {
            return true;
        }
        return false;
    };

    this.users = function(params) {
        if (!params) {
            params = {}
        }
        return Restangular.all('users').getList(params);
    };

    this.getUserDetails = function(userId) {
        return Restangular.one('users', userId).get();
    };

    this.saveUser = function(data) {
        return Restangular.all('users').post(data);
    };

    this.updateUserDetails = function(userId, data) {
        return Restangular.one('users', userId).patch(data);
    };

    this.deleteUser = function(userId) {
        return Restangular.one('users', userId).remove();
    };

    this.changePassword = function(userId, password) {
        var data = {new_password: password};
        return Restangular.one('users', userId).customOperation('patch', 'change_password',
                                                                null, null, data);
    };

    this.setUser = function(user) {
        $localStorage.user = user;
        return $localStorage.user;
    };

    this.getUser = function() {
        return $localStorage.user;
    };

    this.listStaff = function() {
        return Restangular.one('users').all('staff').getList();
    };

    this.login = function(username, password) {
        var params = {username: username, password: password}
        return Restangular.one('users').customPOST(params, 'token');
    };

    this.logout = function() {
        delete $localStorage.user;
    };

});

app.service('GroupService', function(Restangular) {

    this.groups = function(params) {
        if (!params) {
            params = {}
        }
        return Restangular.all('groups').getList(params);
    };

    this.getGroup = function(groupId) {
        return Restangular.one('groups', groupId).get();
    };

    this.saveGroup = function(data) {
        return Restangular.all('groups').post(data);
    };

    this.updateGroup = function(groupId, data) {
        return Restangular.one('groups', groupId).patch(data);
    };

    this.deleteGroup = function(groupId) {
        return Restangular.one('groups', groupId).remove();
    };

    this.permissions = function(params) {
        if (!params) {
            params = {}
        }
        return Restangular.all('permissions').getList(params);
    };

});

app.factory('CountryService', function() {
    return {
        AF: 'Afghanistan',
        AX: 'Åland Islands',
        AL: 'Albania',
        DZ: 'Algeria',
        AS: 'American Samoa',
        AD: 'Andorra',
        AO: 'Angola',
        AI: 'Anguilla',
        AQ: 'Antarctica',
        AG: 'Antigua and Barbuda',
        AR: 'Argentina',
        AM: 'Armenia',
        AW: 'Aruba',
        AU: 'Australia',
        AT: 'Austria',
        AZ: 'Azerbaijan',
        BS: 'Bahamas',
        BH: 'Bahrain',
        BD: 'Bangladesh',
        BB: 'Barbados',
        BY: 'Belarus',
        BE: 'Belgium',
        BZ: 'Belize',
        BJ: 'Benin',
        BM: 'Bermuda',
        BT: 'Bhutan',
        BO: 'Bolivia',
        BQ: 'Bonaire, Sint Eustatius and Saba',
        BA: 'Bosnia and Herzegovina',
        BW: 'Botswana',
        BV: 'Bouvet Island',
        BR: 'Brazil',
        IO: 'British Indian Ocean Territory',
        BN: 'Brunei',
        BG: 'Bulgaria',
        BF: 'Burkina Faso',
        BI: 'Burundi',
        CV: 'Cabo Verde',
        KH: 'Cambodia',
        CM: 'Cameroon',
        CA: 'Canada',
        KY: 'Cayman Islands',
        CF: 'Central African Republic',
        TD: 'Chad',
        CL: 'Chile',
        CN: 'China',
        CX: 'Christmas Island',
        CC: 'Cocos (Keeling) Islands',
        CO: 'Colombia',
        KM: 'Comoros',
        CG: 'Congo',
        CD: 'Congo (the Democratic Republic of the)',
        CK: 'Cook Islands',
        CR: 'Costa Rica',
        CI: 'Côte d\'Ivoire',
        HR: 'Croatia',
        CU: 'Cuba',
        CW: 'Curaçao',
        CY: 'Cyprus',
        CZ: 'Czech Republic',
        DK: 'Denmark',
        DJ: 'Djibouti',
        DM: 'Dominica',
        DO: 'Dominican Republic',
        EC: 'Ecuador',
        EG: 'Egypt',
        SV: 'El Salvador',
        GQ: 'Equatorial Guinea',
        ER: 'Eritrea',
        EE: 'Estonia',
        ET: 'Ethiopia',
        FK: 'Falkland Islands  [Malvinas]',
        FO: 'Faroe Islands',
        FJ: 'Fiji',
        FI: 'Finland',
        FR: 'France',
        GF: 'French Guiana',
        PF: 'French Polynesia',
        TF: 'French Southern Territories',
        GA: 'Gabon',
        GM: 'Gambia',
        GE: 'Georgia',
        DE: 'Germany',
        GH: 'Ghana',
        GI: 'Gibraltar',
        GR: 'Greece',
        GL: 'Greenland',
        GD: 'Grenada',
        GP: 'Guadeloupe',
        GU: 'Guam',
        GT: 'Guatemala',
        GG: 'Guernsey',
        GN: 'Guinea',
        GW: 'Guinea-Bissau',
        GY: 'Guyana',
        HT: 'Haiti',
        HM: 'Heard Island and McDonald Islands',
        VA: 'Holy See',
        HN: 'Honduras',
        HK: 'Hong Kong',
        HU: 'Hungary',
        IS: 'Iceland',
        IN: 'India',
        ID: 'Indonesia',
        IR: 'Iran',
        IQ: 'Iraq',
        IE: 'Ireland',
        IM: 'Isle of Man',
        IL: 'Israel',
        IT: 'Italy',
        JM: 'Jamaica',
        JP: 'Japan',
        JE: 'Jersey',
        JO: 'Jordan',
        KZ: 'Kazakhstan',
        KE: 'Kenya',
        KI: 'Kiribati',
        KW: 'Kuwait',
        KG: 'Kyrgyzstan',
        LA: 'Laos',
        LV: 'Latvia',
        LB: 'Lebanon',
        LS: 'Lesotho',
        LR: 'Liberia',
        LY: 'Libya',
        LI: 'Liechtenstein',
        LT: 'Lithuania',
        LU: 'Luxembourg',
        MO: 'Macao',
        MK: 'Macedonia',
        MG: 'Madagascar',
        MW: 'Malawi',
        MY: 'Malaysia',
        MV: 'Maldives',
        ML: 'Mali',
        MT: 'Malta',
        MH: 'Marshall Islands',
        MQ: 'Martinique',
        MR: 'Mauritania',
        MU: 'Mauritius',
        YT: 'Mayotte',
        MX: 'Mexico',
        FM: 'Micronesia (Federated States of)',
        MD: 'Moldovia',
        MC: 'Monaco',
        MN: 'Mongolia',
        ME: 'Montenegro',
        MS: 'Montserrat',
        MA: 'Morocco',
        MZ: 'Mozambique',
        MM: 'Myanmar',
        NA: 'Namibia',
        NR: 'Nauru',
        NP: 'Nepal',
        NL: 'Netherlands',
        NC: 'New Caledonia',
        NZ: 'New Zealand',
        NI: 'Nicaragua',
        NE: 'Niger',
        NG: 'Nigeria',
        NU: 'Niue',
        NF: 'Norfolk Island',
        KP: 'North Korea',
        MP: 'Northern Mariana Islands',
        NO: 'Norway',
        OM: 'Oman',
        PK: 'Pakistan',
        PW: 'Palau',
        PS: 'Palestine, State of',
        PA: 'Panama',
        PG: 'Papua New Guinea',
        PY: 'Paraguay',
        PE: 'Peru',
        PH: 'Philippines',
        PN: 'Pitcairn',
        PL: 'Poland',
        PT: 'Portugal',
        PR: 'Puerto Rico',
        QA: 'Qatar',
        RE: 'Réunion',
        RO: 'Romania',
        RU: 'Russia',
        RW: 'Rwanda',
        BL: 'Saint Barthélemy',
        SH: 'Saint Helena, Ascension and Tristan da Cunha',
        KN: 'Saint Kitts and Nevis',
        LC: 'Saint Lucia',
        MF: 'Saint Martin (French part)',
        PM: 'Saint Pierre and Miquelon',
        VC: 'Saint Vincent and the Grenadines',
        WS: 'Samoa',
        SM: 'San Marino',
        ST: 'Sao Tome and Principe',
        SA: 'Saudi Arabia',
        SN: 'Senegal',
        RS: 'Serbia',
        SC: 'Seychelles',
        SL: 'Sierra Leone',
        SG: 'Singapore',
        SX: 'Sint Maarten (Dutch part)',
        SK: 'Slovakia',
        SI: 'Slovenia',
        SB: 'Solomon Islands',
        SO: 'Somalia',
        ZA: 'South Africa',
        GS: 'South Georgia and the South Sandwich Islands',
        KR: 'South Korea',
        SS: 'South Sudan',
        ES: 'Spain',
        LK: 'Sri Lanka',
        SD: 'Sudan',
        SR: 'Suriname',
        SJ: 'Svalbard and Jan Mayen',
        SZ: 'Swaziland',
        SE: 'Sweden',
        CH: 'Switzerland',
        SY: 'Syria',
        TW: 'Taiwan',
        TJ: 'Tajikistan',
        TZ: 'Tanzania',
        TH: 'Thailand',
        TL: 'Timor-Leste',
        TG: 'Togo',
        TK: 'Tokelau',
        TO: 'Tonga',
        TT: 'Trinidad and Tobago',
        TN: 'Tunisia',
        TR: 'Turkey',
        TM: 'Turkmenistan',
        TC: 'Turks and Caicos Islands',
        TV: 'Tuvalu',
        UG: 'Uganda',
        UA: 'Ukraine',
        AE: 'United Arab Emirates',
        GB: 'United Kingdom of Great Britain and Northern Ireland',
        UM: 'United States Minor Outlying Islands',
        US: 'United States of America',
        UY: 'Uruguay',
        UZ: 'Uzbekistan',
        VU: 'Vanuatu',
        VE: 'Venezuela',
        VN: 'Vietnam',
        VG: 'Virgin Islands (British)',
        VI: 'Virgin Islands (U.S.)',
        WF: 'Wallis and Futuna',
        EH: 'Western Sahara',
        YE: 'Yemen',
        ZM: 'Zambia',
        ZW: 'Zimbabwe',
    };
});
