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

const AdministrationGroup = () => {
    const history = useHistory();
    const {t} = useTranslation('jahia-administration');
    return (
        <PrimaryNavItem key={constants.DEFAULT_ROUTE}
                        isSelected={history.location.pathname.startsWith(constants.DEFAULT_ROUTE)}
                        label={t('jahia-administration.label')}
                        icon={<Setting/>}
                        onClick={() => history.push(`${constants.DEFAULT_ROUTE}`)}/>
    );
};

const Administration = () => {
    const history = useHistory();
    const {t} = useTranslation();
    const loadingNamespace = loadNamespace('jahia-administration');

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
                <SecondaryNav header={<Typography variant="section">{t('jahia-administration:jahia-administration.label')}</Typography>}>
                    <Accordion openedItem={accordionOpenTab}>
                        <AccordionItem id={constants.ACCORDION_TABS.SERVER} label={t('jahia-administration:jahia-administration.server')} icon={<Server size="big"/>}>
                            <TreeView data={dataServer}
                                      selectedItems={treeSelected}
                                      defaultOpenedItems={treeSelected}
                                      onClickItem={elt => history.push(elt.route)}/>
                        </AccordionItem>
                        <AccordionItem id={constants.ACCORDION_TABS.SITE} label={t('jahia-administration:jahia-administration.sites')} icon={<SiteWeb size="big"/>}>
                            <TreeView data={dataSites}
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
    registry.add('bottomAdminGroup', 'administrationGroupItem', {
        targets: ['nav-root-bottom:1'],
        render: () => <AdministrationGroup/>
    });
};
