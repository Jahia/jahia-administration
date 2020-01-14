import React, {Suspense} from 'react';
import {registry} from '@jahia/registry';
import constants from './Administration.constants';

export const registerRoute = (componentToRender = 'Jahia Administration') => {
    registry.add('route-administration', {
        type: 'route',
        target: ['nav-root-top:1'],
        path: `${constants.DEFAULT_ROUTE}/*`, // Catch everything administration and let the app handle routing logic
        defaultPath: constants.DEFAULT_ROUTE,
        render: () => <Suspense fallback="loading ...">{componentToRender}</Suspense>
    });
};

window.contextJsParameters.namespaceResolvers['jahia-administration'] = lang => require('../../main/resources/javascript/locales/' + lang + '.json');

console.log('%c Jahia Administration is activated', 'color: #3c8cba');
