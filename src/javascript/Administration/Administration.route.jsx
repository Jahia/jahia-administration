import React, {Suspense} from 'react';
import {registry} from '@jahia/registry';

export const registerRoute = (componentToRender = 'Jahia Administration') => {
    registry.add('route-administration', {
        type: 'route',
        target: ['nav-root-top:1'],
        path: '/administration',
        defaultPath: '/administration',
        render: () => <Suspense fallback="loading ...">{componentToRender}</Suspense>
    });
};

window.contextJsParameters.namespaceResolvers['jahia-administration'] = lang => require('../../main/resources/javascript/locales/' + lang + '.json');

console.log('%c Jahia Administration is activated', 'color: #3c8cba');
