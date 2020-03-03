import React, {Suspense} from 'react';
import PropTypes from 'prop-types';
import {registry, IframeRenderer} from '@jahia/ui-extender';
import constants from './Administration.constants';

export const registerRoute = (componentToRender = 'Jahia Administration') => {
    registry.add('route', 'route-administration', {
        targets: ['nav-root-top:1'],
        path: `${constants.DEFAULT_ROUTE}*`, // Catch everything administration and let the app handle routing logic
        defaultPath: constants.DEFAULT_ROUTE,
        render: () => <Suspense fallback="loading ...">{componentToRender}</Suspense>
    });
};

export const registerRouteLv2 = (level = 'server', route = null, path = null, label = 'Default Label', icon = null, target = null, priority = 1, childrenTarget = null, isSelectable = true) => {
    let administrationServer = level === 'server' ? 'administration-server' : 'administration-sites';
    let s = target === null ? administrationServer : `${administrationServer}-${target}`;
    let path1 = path === null ? constants.DEFAULT_ROUTE : `${constants.DEFAULT_ROUTE}/${path}`;
    registry.add('adminRoute', `${administrationServer}-${path.toLowerCase()}`, {
        id: route,
        targets: [`${s}:${priority}`],
        path: path1,
        defaultPath: path1,
        icon: icon,
        label: label,
        childrenTarget: childrenTarget,
        isSelectable: isSelectable,
        render: props => (
            <Suspense fallback="loading ...">
                {route && <RenderAdminRoute route={route} level={level} {...props}/>}
            </Suspense>
        ),
        level,
        route
    });
};

export const RenderAdminRoute = props => {
    console.log('Frame', props);

    if (props.route === null) {
        return null;
    }

    // If render fcn is defined use it as it implies that the user has something custom in mind
    if (props.render) {
        return props.render();
    }

    let url = `${window.contextJsParameters.contextPath}/cms/adminframe/default/$lang`;
    if (props.level === 'server') {
        url += `/settings.${props.route}.html?redirect=false`;
    } else {
        url += `/sites/$site-key.${props.route}.html`;
    }

    return (
        <Suspense fallback="loading ...">
            <IframeRenderer url={url}/>
        </Suspense>
    );
};

RenderAdminRoute.propTypes = {
    route: PropTypes.string.isRequired,
    level: PropTypes.string.isRequired,
    render: PropTypes.func
};

console.log('%c Jahia Administration is activated', 'color: #3c8cba');
