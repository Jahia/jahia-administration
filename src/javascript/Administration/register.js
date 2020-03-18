import {registry} from '@jahia/ui-extender';
import constants from './Administration.constants';
import Administration from './Administration';
import AdministrationEmpty from './Administration.empty';
import AdministrationGroup from './AdministrationGroup';
import React, {Suspense} from 'react';

export const registerAdministration = () => {
    registry.add('route', 'route-administration', {
        targets: ['nav-root-top:1'],
        path: `${constants.DEFAULT_ROUTE}*`, // Catch everything administration and let the app handle routing logic
        defaultPath: constants.DEFAULT_ROUTE,
        render: v => <Suspense fallback="loading ..."><Administration match={v.match}/></Suspense>
    });
    registry.add('adminRoute', 'administration-server', {
        omitFromTree: true,
        targets: ['administration-server:999'],
        path: `${constants.DEFAULT_ROUTE}`,
        defaultPath: constants.DEFAULT_ROUTE,
        render: () => <AdministrationEmpty/>
    });
    registry.add('primary-nav-item', 'administrationGroupItem', {
        targets: ['nav-root-admin:1'],
        render: () => <AdministrationGroup/>
    });
};
