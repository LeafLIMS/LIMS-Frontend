var authconfig = {
    endpoint: 'api',
    configureEndpoints: ['api'],
    authTokenType: 'JWT',
    signupUrl: 'auth/register/',
    loginUrl: 'users/token/',
    loginRedirect: '#dashboard',
    logoutRedirect: '#',
    profileUrl: 'users/me/',
    profileMethod: 'patch',
};

export default authconfig;

