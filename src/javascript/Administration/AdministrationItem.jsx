import {useHistory} from 'react-router';
import {useTranslation} from 'react-i18next';
import {useNodeInfo} from '@jahia/data-helper';
import {useSelector, shallowEqual} from 'react-redux';
import {PrimaryNavItem} from '@jahia/moonstone';
import constants from './Administration.constants';
import {Setting} from '@jahia/moonstone';
import React from 'react';
import {setTitle} from './util';

const AdministrationItem = props => {
    const history = useHistory();
    const {t} = useTranslation('jahia-administration');
    const serverPermission = useNodeInfo({path: '/', language: 'en'}, {getPermissions: ['administrationAccess']});
    const current = useSelector(state => ({site: state.site, lastVisitedPath: state.administration.path}), shallowEqual);
    const sitePermission = useNodeInfo({
        path: '/sites/' + current.site,
        language: 'en'
    }, {getPermissions: ['siteAdministrationAccess']});
    if (serverPermission.loading === true || sitePermission.loading === true || (serverPermission.node?.administrationAccess === false && sitePermission.node?.siteAdministrationAccess === false)) {
        return null;
    }

    let route = constants.DEFAULT_ROUTE;
    if (current.lastVisitedPath !== undefined && (current.lastVisitedPath.split('/').length === 3 || current.lastVisitedPath.indexOf(current.site) >= 0)) {
        route = current.lastVisitedPath;
    }

    return (
        <PrimaryNavItem key={constants.DEFAULT_ROUTE}
                        {...props}
                        isSelected={history.location.pathname.startsWith(constants.DEFAULT_ROUTE)}
                        label={t('jahia-administration.label')}
                        icon={<Setting/>}
                        onClick={() => {
                            history.push(route);
                            setTitle(`${t('jahia-administration.label')} - ${route}`);
                        }}/>
    );
};

export default AdministrationItem;
