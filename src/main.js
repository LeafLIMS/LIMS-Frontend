import environment from './environment';
import authconfig from './auth-config';
import { AureliaConfiguration } from 'aurelia-configuration';

export function configure(aurelia) {
  aurelia.use
    .standardConfiguration()
    .feature('resources')
    .plugin('aurelia-dialog', config => {
        config.useDefaults();
        config.settings.lock = true;
        config.settings.centerHorizontalOnly = true;
    })
    .plugin('aurelia-animator-css')
    .plugin('aurelia-validation')
    .plugin('aurelia-configuration')
    .plugin('aurelia-api', config => {
        config.registerEndpoint('api', configure => {
            let ac = aurelia.container.get(AureliaConfiguration);
            configure.withBaseUrl(ac.get('api_endpoint', 'http://localhost:8000/'));
            configure.withInterceptor({
                response(response) {
                    return response;
                }
            });
        });
    })
    .plugin('aurelia-authentication', (baseConfig) => {
        baseConfig.configure(authconfig);
    })
    .plugin('aurelia-sortablejs')
    .feature('components/semantic-ui')
    .feature('components/shared');

  if (environment.debug) {
    aurelia.use.developmentLogging();
  }

  if (environment.testing) {
    aurelia.use.plugin('aurelia-testing');
  }

  aurelia.start().then(() => aurelia.setRoot());
}
