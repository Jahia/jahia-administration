import React from 'react';
import {registry} from '@jahia/registry';
import {useHistory} from 'react-router-dom';
import {PrimaryNavItem} from '@jahia/moonstone';
import {registerRoute} from './Administration.route';
import {useTranslation} from 'react-i18next';
import Settings from '@jahia/moonstone/dist/icons/Setting';
import constants from './Administration.constants';
import {loadNamespace} from './Administration.loadNamespace';

// Entry point component
const Administration = () => {
    const loadingNamespace = loadNamespace('jahia-administration');

    if (loadingNamespace) {
        return 'Loading screen';
    }

    return <h2 style={{color: 'white'}}>Jahia Administration Component</h2>;
};

const AdministrationGroup = () => {
    const history = useHistory();
    const {t} = useTranslation('jahia-administration');
    return (
        <PrimaryNavItem key={constants.DEFAULT_ROUTE}
                        isSelected={history.location.pathname.startsWith(constants.DEFAULT_ROUTE)}
                        label={t('jahia-administration.label')}
                        icon={<Settings/>}
                        onClick={() => history.push(`${constants.DEFAULT_ROUTE}/replace-with-something-sensible`)}/>
    );
};

export const registerAdministration = () => {
    registerRoute(<Administration/>);
    registry.add('administrationGroupItem', {
        type: 'bottomAdminGroup',
        target: ['nav-root-bottom:1'],
        render: () => <AdministrationGroup/>
    });
};

