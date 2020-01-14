import React from 'react';
import {registry} from '@jahia/registry';
import {useHistory} from 'react-router-dom';
import {PrimaryNavItem} from '@jahia/moonstone';
import {registerRoute} from './Administration.route';
import {useTranslation} from 'react-i18next';
import Settings from '@jahia/moonstone/dist/icons/Setting';

const ROUTE = '/administration';

const AdministrationGroup = () => {
    const history = useHistory();
    const {t} = useTranslation('jahia-administration');
    return (
        <PrimaryNavItem key={ROUTE}
                        isSelected={history.location.pathname.endsWith(ROUTE)}
                        label={t('jahia-administration.label')}
                        icon={<Settings/>}
                        onClick={() => history.push(ROUTE)}/>
    );
};

const Administration = () => 'Jahia Administration Component';

export const registerAdministration = () => {
    registerRoute(<Administration/>);
    registry.add('administrationGroupItem', {
        type: 'bottomAdminGroup',
        target: ['nav-root-bottom:1'],
        render: () => <AdministrationGroup/>
    });
};

