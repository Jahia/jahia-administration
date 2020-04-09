import {registry} from '@jahia/ui-extender';
import constants from './Administration.constants';
import Administration from './Administration';
import AdministrationGroup from './AdministrationGroup';
import React, {Suspense} from 'react';

export const registerAdministration = () => {
    registry.add('route', 'route-administration', {
        targets: ['main:1'],
        path: `${constants.DEFAULT_ROUTE}*`, // Catch everything administration and let the app handle routing logic
        defaultPath: constants.DEFAULT_ROUTE,
        render: v => <Suspense fallback="loading ..."><Administration match={v.match}/></Suspense>
    });
    registry.add('primary-nav-item', 'administrationGroupItem', {
        targets: ['nav-root-admin:1'],
        render: () => <AdministrationGroup/>
    });
};
