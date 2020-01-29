import React, {Suspense} from 'react';
import PropTypes from 'prop-types';
import {registry} from '@jahia/ui-extender';
import AdministrationIframe from './iFrames/AdministrationIframe';
import SiteIframe from './iFrames/SiteIframe';
import constants from './Administration.constants';

export const registerRoute = (componentToRender = 'Jahia Administration') => {
    registry.add('route', 'route-administration', {
        targets: ['nav-root-top:1'],
        path: `${constants.DEFAULT_ROUTE}/*`, // Catch everything administration and let the app handle routing logic
        defaultPath: constants.DEFAULT_ROUTE,
        render: () => <Suspense fallback="loading ...">{componentToRender}</Suspense>
    });
};

export const registerRouteLv2 = (level = 'server', route = null, path = null, label = 'Default Label', icon = null, target = null, priority = 1, childrenTarget = null, isSelectable = true) => {
    let administrationServer = level === 'server' ? 'administration-server' : 'administration-sites';
    let IframeComponent = level === 'server' ? AdministrationIframe : SiteIframe;
    let s = target === null ? administrationServer : `${administrationServer}-${target}`;
    let path1 = path === null ? constants.DEFAULT_ROUTE : `${constants.DEFAULT_ROUTE}/${path}`;
    registry.add('route', `${administrationServer}-${path.toLowerCase()}`, {
        id: route,
        targets: [`${s}:${priority}`],
        path: path1,
        defaultPath: path1,
        icon: icon,
        label: label,
        childrenTarget: childrenTarget,
        isSelectable: isSelectable,
        render: () => (
            <Suspense fallback="loading ...">
                {route && <IframeComponent route={route}/>}
            </Suspense>
        ),
        level,
        route
    });
};

export const RenderIframe = props => {
    console.log('Frame', props);
    const IframeComponent = props.level === 'server' ? AdministrationIframe : SiteIframe;

    if (props.route === null) {
        return null;
    }

    // If render fcn is defined use it as it implies that the user has something custom in mind
    if (props.render) {
        return props.render();
    }

    return (
        <Suspense fallback="loading ...">
            <IframeComponent route={props.route}/>
        </Suspense>
    );
};

RenderIframe.propTypes = {
    route: PropTypes.string.isRequired,
    level: PropTypes.string.isRequired,
    render: PropTypes.func.isRequired
};

console.log('%c Jahia Administration is activated', 'color: #3c8cba');
