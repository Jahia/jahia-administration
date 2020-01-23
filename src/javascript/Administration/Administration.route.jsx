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

export const registerRouteLv2 = (level = 'server', componentToRender = 'Jahia Administration', path = '', label = 'Default Label', icon = null, target = '', priority = 1, childrenTarget = null, isSelectable = true) => {
    let administrationServer = level === 'server' ? 'administration-server' : 'administration-sites';
    let s = target === '' ? administrationServer : `${administrationServer}-${target}`;
    let path1 = path === '' ? constants.DEFAULT_ROUTE : `${constants.DEFAULT_ROUTE}/${path}`;
    registry.add(`${administrationServer}-${path.toLowerCase()}`, {
        type: 'route',
        target: [`${s}:${priority}`],
        path: path1,
        defaultPath: path1,
        icon: icon,
        label: label,
        childrenTarget: childrenTarget,
        isSelectable: isSelectable,
        render: () => <Suspense fallback="loading ...">{componentToRender}</Suspense>
    });
};

window.contextJsParameters.namespaceResolvers['jahia-administration'] = lang => require('../../main/resources/javascript/locales/' + lang + '.json');

console.log('%c Jahia Administration is activated', 'color: #3c8cba');
