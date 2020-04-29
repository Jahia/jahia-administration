import './Administration';
import {registry} from '@jahia/ui-extender';

registry.add('callback', 'jahia-administration', {
    targets: ['jahiaApp-init:2'],
    callback: () => Promise.all([
        window.jahia.i18n.loadNamespaces('jahia-administration')
    ])
});
