export function configure(aurelia) {
    aurelia.globalResources('./ll-template-hook',
                            './ll-permissions',
                            './limit-length',
                            './map-href',
                            './date-format',
                            './calendar');
}
