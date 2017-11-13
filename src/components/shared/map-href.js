import {customAttribute, bindable} from 'aurelia-templating';
import {inject} from 'aurelia-dependency-injection';
import {Router} from 'aurelia-router';
import {DOM} from 'aurelia-pal';
import * as LogManager from 'aurelia-logging';
import {RouteMapper} from 'aurelia-route-mapper';

const logger = LogManager.getLogger('map-href');

@customAttribute('map-href')
@bindable({name: 'route', changeHandler: 'processChange', primaryProperty: true})
@bindable({name: 'params', changeHandler: 'processChange'})
@bindable({name: 'attribute', defaultValue: 'href'})
@inject(Router, DOM.Element, RouteMapper)
export class RouteChref {
  constructor(router, element, routeMapper) {
      this.router = router;
      this.element = element;
      this.mapper = routeMapper;
  }

  attached() {
    this.isActive = true;
    this.processChange();
  }

  unbind() {
    this.isActive = false;
  }

  attributeChanged(value, previous) {
    if (previous) {
      this.element.removeAttribute(previous);
    }

    this.processChange();
  }

  processChange() {
    return this.router.ensureConfigured()
      .then(() => {
        if (!this.isActive) {
          return null;
        }

        let href = ''
        if (!this.router.options.pushState) {
            href += '#';
        }
        href += this.mapper.generate(this.route, this.params);

        if (this.element.au.controller) {
          this.element.au.controller.viewModel[this.attribute] = href;
        } else {
          this.element.setAttribute(this.attribute, href);
        }

        return null;
      }).catch(reason => {
        logger.error(reason);
      });
  }
}
