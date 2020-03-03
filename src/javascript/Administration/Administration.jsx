import React from 'react';
import {registry} from '@jahia/ui-extender';
import {useHistory} from 'react-router-dom';
import {Accordion, AccordionItem, LayoutModule, PrimaryNavItem, SecondaryNav, TreeView, Typography} from '@jahia/moonstone';
import {registerRoute, registerRouteLv2, RenderIframe} from './Administration.route';
import {useTranslation} from 'react-i18next';
import Server from '@jahia/moonstone/dist/icons/Server';
import Setting from '@jahia/moonstone/dist/icons/Setting';
import SiteWeb from '@jahia/moonstone/dist/icons/SiteWeb';
import constants from './Administration.constants';
import {Route, Switch} from 'react-router';
import {loadNamespace} from './Administration.loadNamespace';
import AdministrationEmpty from './Administration.empty';
import {useNodeChecks} from '@jahia/data-helper';

const AdministrationGroup = () => {
    const history = useHistory();
    const {t} = useTranslation('jahia-administration');
    const permission = useNodeChecks({path: '/', language: 'en'}, {requiredPermission: ['administrationAccess']});
    if (permission.loading === true || permission.node.administrationAccess === false) {
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

const Administration = () => {
    const history = useHistory();
    const {t} = useTranslation();
    let requiredPermission = ['administrationAccess'];
    let buildRequiredPermissions = function (currentLevelRoute, registryTargetParent) {
        currentLevelRoute.forEach(route => {
            let permission = route.requiredPermission;
            if (permission) {
                if (Array.isArray(permission)) {
                    requiredPermission = requiredPermission.concat(permission.filter(p => requiredPermission.indexOf(p) === -1));
                } else if (requiredPermission.indexOf(permission) === -1) {
                    requiredPermission.push(permission);
                }
            }

            if (route.childrenTarget !== null) {
                buildRequiredPermissions(registry.find({
                    type: 'adminRoute',
                    target: `${registryTargetParent}-${route.childrenTarget}`
                }));
            }
        });
    };

    buildRequiredPermissions(registry.find({
        type: 'adminRoute',
        target: 'administration-server'
    }), 'administration-server');

    buildRequiredPermissions(registry.find({
        type: 'adminRoute',
        target: 'administration-server'
    }), 'administration-sites');

    const permissions = useNodeChecks({path: '/', language: 'en'}, {requiredPermission: requiredPermission});
    const loadingNamespace = loadNamespace('jahia-administration');
    if (permissions.loading === true || permissions.node.administrationAccess === false) {
        return null;
    }

    if (loadingNamespace) {
        return 'Loading screen';
    }

    const routes = [];
    const dataServer = [];
    const dataSites = [];
    let createTreeStructureAndAggregateRoutes = function (currentLevelRoute, parent, registryTargetParent) {
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

            if (route.childrenTarget !== null) {
                createTreeStructureAndAggregateRoutes(registry.find({
                    type: 'adminRoute',
                    target: `${registryTargetParent}-${route.childrenTarget}`
                }), treeEntry.children);
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
    }), dataServer, 'administration-server');

    createTreeStructureAndAggregateRoutes(registry.find({
        type: 'adminRoute',
        target: 'administration-sites'
    }), dataSites, 'administration-sites');

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

    console.log('Tree', dataServer);

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
                <SecondaryNav header={<Typography variant="heading" style={{padding: 20}}>{t('jahia-administration:jahia-administration.label')}</Typography>}>
                    <Accordion defaultOpenedItem={accordionOpenTab}>
                        <AccordionItem id={constants.ACCORDION_TABS.SERVER}
                                       label={t('jahia-administration:jahia-administration.server')}
                                       icon={<Server/>}
                        >
                            <TreeView isReversed
                                      data={dataServer}
                                      selectedItems={treeSelected}
                                      defaultOpenedItems={treeSelected}
                                      onClickItem={elt => history.push(elt.route)}/>
                        </AccordionItem>
                        <AccordionItem id={constants.ACCORDION_TABS.SITE}
                                       label={t('jahia-administration:jahia-administration.sites')}
                                       icon={<SiteWeb/>}
                        >
                            <TreeView isReversed
                                      data={dataSites}
                                      selectedItems={treeSelected}
                                      defaultOpenedItems={treeSelected}
                                      onClickItem={elt => history.push(elt.route.replace(':siteKey', window.contextJsParameters.siteKey))}/>
                        </AccordionItem>
                    </Accordion>
                </SecondaryNav>
            }
            content={
                <Switch>
                    {routes.map(r =>
                        <Route key={r.key} path={r.path} render={() => <RenderIframe {...r}/>}/>
                    )}
                </Switch>
            }
        />
    );
};

export const registerAdministration = () => {
    registerRoute(<Administration/>);
    registerRouteLv2('sites', 'manageModules', ':siteKey/manageModules', 'Modules', null);
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
