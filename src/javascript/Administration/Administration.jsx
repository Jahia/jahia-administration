import React, {useEffect} from 'react';
import {registry} from '@jahia/ui-extender';
import {useHistory} from 'react-router-dom';
import {Accordion, AccordionItem, LayoutModule, PrimaryNavItem, SecondaryNav, SecondaryNavHeader, TreeView} from '@jahia/moonstone';
import {registerRoute, RenderAdminRoute} from './Administration.route';
import {useTranslation} from 'react-i18next';
import Server from '@jahia/moonstone/dist/icons/Server';
import Setting from '@jahia/moonstone/dist/icons/Setting';
import SiteWeb from '@jahia/moonstone/dist/icons/SiteWeb';
import constants from './Administration.constants';
import {Route, Switch} from 'react-router';
import {loadNamespace} from './Administration.loadNamespace';
import AdministrationEmpty from './Administration.empty';
import {useNodeInfo} from '@jahia/data-helper';
import {useDispatch, useSelector} from 'react-redux';
import SiteSwitcher from './SiteSwitcher/SiteSwitcher';

const AdministrationGroup = () => {
    const history = useHistory();
    const {t} = useTranslation('jahia-administration');
    const serverPermission = useNodeInfo({path: '/', language: 'en'}, {getPermissions: ['administrationAccess']});
    const currentSite = useSelector(state => ({site: state.site}));
    const sitePermission = useNodeInfo({
        path: '/sites/' + currentSite.site,
        language: 'en'
    }, {getPermissions: ['siteAdministrationAccess']});
    if (serverPermission.loading === true || sitePermission.loading === true || (serverPermission.node.administrationAccess === false && sitePermission.node.siteAdministrationAccess === false)) {
        return null;
    }

    return (
        <PrimaryNavItem key={constants.DEFAULT_ROUTE}
                        role="administration-menu-item"
                        isSelected={history.location.pathname.startsWith(constants.DEFAULT_ROUTE)}
                        label={t('jahia-administration.label')}
                        icon={<Setting/>}
                        onClick={() => history.push(`${constants.DEFAULT_ROUTE}`)}/>
    );
};

let currentSite;
let dispatch;

const administrationMessageListener = event => {
    if (event.origin !== window.location.origin) {
        return;
    }

    if (event.data !== null && event.data.msg !== null) {
        if (event.data.msg === 'updatedSitesList') {
            let sites = event.data.sites;
            if (!sites.find(site => site === currentSite)) {
                console.log('updatedSitesList msg received and current site not found in existing list, switching site in environmemnt' +
                    ' to default site');
                dispatch(registry.get('redux-reducer', 'site').actions.setSite((event.data.defaultSite === undefined ? 'systemsite' : event.data.defaultSite)));
            }
        }
    }
};

const Administration = () => {
    const history = useHistory();
    const {t} = useTranslation();
    let serverRequiredPermission = ['administrationAccess'];
    let siteRequiredPermission = ['siteAdministrationAccess'];
    let buildRequiredPermissions = function (currentLevelRoute, registryTargetParent, permissionsArray) {
        currentLevelRoute.forEach(route => {
            let permission = route.requiredPermission;
            if (permission) {
                if (Array.isArray(permission)) {
                    permissionsArray = permissionsArray.concat(permission.filter(p => permissionsArray.indexOf(p) === -1));
                } else if (permissionsArray.indexOf(permission) === -1) {
                    permissionsArray.push(permission);
                }
            }

            if (route.childrenTarget !== undefined && route.childrenTarget !== null) {
                let target = `${registryTargetParent}-${route.childrenTarget}`;
                let childrenRoutes = registry.find({
                    type: 'adminRoute',
                    target: target
                });
                buildRequiredPermissions(childrenRoutes, target, permissionsArray);
            }
        });
    };

    buildRequiredPermissions(registry.find({
        type: 'adminRoute',
        target: 'administration-server'
    }), 'administration-server', serverRequiredPermission);
    buildRequiredPermissions(registry.find({
        type: 'adminRoute',
        target: 'administration-sites'
    }), 'administration-sites', siteRequiredPermission);
    currentSite = useSelector(state => ({site: state.site}));
    dispatch = useDispatch();
    const serverPermissions = useNodeInfo({path: '/', language: 'en'}, {getPermissions: serverRequiredPermission});
    const sitePermissions = useNodeInfo({
        path: '/sites/' + currentSite.site,
        language: 'en'
    }, {getPermissions: siteRequiredPermission});

    const loadingNamespace = loadNamespace('jahia-administration');
    useEffect(() => {
        window.addEventListener('message', administrationMessageListener, false);

        return () => {
            window.removeEventListener('message', administrationMessageListener, false);
        };
    });

    if (serverPermissions.loading === true || sitePermissions.loading === true ||
        (serverPermissions.node.administrationAccess === false && sitePermissions.node.siteAdministrationAccess === false)) {
        return null;
    }

    if (loadingNamespace) {
        return 'Loading screen';
    }

    const routes = [];
    const dataServer = [];
    const dataSites = [];
    let createTreeStructureAndAggregateRoutes = function (currentLevelRoute, parent, registryTargetParent, permissions) {
        currentLevelRoute.forEach(route => {
            if (route.omitFromTree) {
                routes.push(route);
                return;
            }

            if (route.requiredPermission !== undefined && permissions.node[route.requiredPermission] === false) {
                return;
            }

            let treeEntry = {
                id: route.id || route.label.toLowerCase().replace(' ', ''),
                label: t(route.label),
                isSelectable: route.isSelectable,
                children: []
            };
            if (route.icon !== null) {
                treeEntry.iconStart = route.icon;
            }

            if (route.childrenTarget !== undefined && route.childrenTarget !== null) {
                let target = `${registryTargetParent}-${route.childrenTarget}`;
                let childrenRoutes = registry.find({
                    type: 'adminRoute',
                    target: target
                });
                createTreeStructureAndAggregateRoutes(childrenRoutes, treeEntry.children, target, permissions);
            }

            if (route.isSelectable) {
                treeEntry.route = route.defaultPath;
                routes.push(route);
            }

            parent.push(treeEntry);
        });
    };

    createTreeStructureAndAggregateRoutes(registry.find({
        type: 'adminRoute',
        target: 'administration-server'
    }), dataServer, 'administration-server', serverPermissions);

    createTreeStructureAndAggregateRoutes(registry.find({
        type: 'adminRoute',
        target: 'administration-sites'
    }), dataSites, 'administration-sites', sitePermissions);

    let getSelectedItems = function () {
        let selectedItems = [];
        let split = history.location.pathname.split('/');
        selectedItems.push(split.pop());
        return selectedItems;
    };

    let getOpenedByDefault = function (selectedItem) {
        if (recursiveIdCheck(dataServer, selectedItem)) {
            return constants.ACCORDION_TABS.SERVER;
        }

        if (recursiveIdCheck(dataSites, selectedItem)) {
            return constants.ACCORDION_TABS.SITE;
        }

        return 'server';
    };

    console.log('Routes', routes, serverPermissions, sitePermissions);

    const recursiveIdCheck = function (data, selectedItem) {
        return data.find(node => {
            if (node.id === selectedItem) {
                return true;
            }

            if (node.children && node.children.length > 0) {
                return recursiveIdCheck(node.children, selectedItem);
            }

            return false;
        }) !== undefined;
    };

    const treeSelected = getSelectedItems();
    const accordionOpenTab = getOpenedByDefault(treeSelected[0]);
    return (
        <LayoutModule
            navigation={
                <SecondaryNav header={<SecondaryNavHeader>{t('jahia-administration:jahia-administration.label')}</SecondaryNavHeader>}>
                    <Accordion defaultOpenedItem={accordionOpenTab}>
                        {serverPermissions.node.administrationAccess &&
                        <AccordionItem id={constants.ACCORDION_TABS.SERVER}
                                       label={t('jahia-administration:jahia-administration.server')}
                                       icon={<Server/>}
                        >
                            <TreeView isReversed
                                      data={dataServer}
                                      selectedItems={treeSelected}
                                      defaultOpenedItems={treeSelected}
                                      onClickItem={elt => history.push(elt.route)}/>
                        </AccordionItem>}
                        {sitePermissions.node.siteAdministrationAccess &&
                        <AccordionItem id={constants.ACCORDION_TABS.SITE}
                                       label={t('jahia-administration:jahia-administration.sites')}
                                       icon={<SiteWeb/>}
                        >
                            <SiteSwitcher/>
                            <TreeView isReversed
                                      data={dataSites}
                                      selectedItems={treeSelected}
                                      defaultOpenedItems={treeSelected}
                                      onClickItem={elt => history.push(elt.route.replace(':siteKey', currentSite.site))}/>
                        </AccordionItem>}
                    </Accordion>
                </SecondaryNav>
            }
            content={
                <Switch>
                    {routes.filter(r => r.requiredPermission === undefined ||
                        serverPermissions.node[r.requiredPermission] ||
                        sitePermissions.node[r.requiredPermission]).map(r =>
                            <Route key={r.key} exact strict path={r.path} render={() => <RenderAdminRoute {...r}/>}/>
                    )}
                </Switch>
            }
        />
    );
};

export const registerAdministration = () => {
    registerRoute(<Administration/>);
    registry.add('adminRoute', 'administration-server', {
        omitFromTree: true,
        targets: ['administration-server:999'],
        path: `${constants.DEFAULT_ROUTE}`,
        defaultPath: constants.DEFAULT_ROUTE,
        render: () => <AdministrationEmpty/>
    });
    registry.add('adminRoute', 'administration-sites', {
        omitFromTree: true,
        targets: ['administration-sites:100'],
        path: `${constants.DEFAULT_ROUTE}/:siteKey/settings`,
        defaultPath: constants.DEFAULT_ROUTE,
        render: () => {
            return 'Test Site Settings';
        }
    });
    registry.add('primary-nav-item', 'administrationGroupItem', {
        targets: ['nav-root-admin:1'],
        render: () => <AdministrationGroup/>
    });
};
