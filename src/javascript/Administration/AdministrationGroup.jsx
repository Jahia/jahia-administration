import {useHistory} from 'react-router';
import {useTranslation} from 'react-i18next';
import {useNodeInfo} from '@jahia/data-helper';
import {useSelector} from 'react-redux';
import {PrimaryNavItem} from '@jahia/moonstone';
import constants from './Administration.constants';
import Setting from '@jahia/moonstone/dist/icons/Setting';
import React from 'react';

const AdministrationGroup = () => {
    const history = useHistory();
    const {t} = useTranslation('jahia-administration');
    const serverPermission = useNodeInfo({path: '/', language: 'en'}, {getPermissions: ['administrationAccess']});
    const current = useSelector(state => ({site: state.site, lastVisitedPath: state.administration.path}));
    const sitePermission = useNodeInfo({
        path: '/sites/' + current.site,
        language: 'en'
    }, {getPermissions: ['siteAdministrationAccess']});
    if (serverPermission.loading === true || sitePermission.loading === true || (serverPermission.node.administrationAccess === false && sitePermission.node.siteAdministrationAccess === false)) {
        return null;
    }

    let route = constants.DEFAULT_ROUTE;
    if (current.lastVisitedPath !== undefined && (current.lastVisitedPath.split('/').length === 3 || current.lastVisitedPath.indexOf(current.site) >= 0)) {
        route = current.lastVisitedPath;
    }

    return (
        <PrimaryNavItem key={constants.DEFAULT_ROUTE}
                        role="administration-menu-item"
                        isSelected={history.location.pathname.startsWith(constants.DEFAULT_ROUTE)}
                        label={t('jahia-administration.label')}
                        icon={<Setting/>}
                        onClick={() => history.push(route)}/>
    );
};

export default AdministrationGroup;
