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
