import React from 'react';
import {registry} from '@jahia/registry';
import {useHistory} from 'react-router-dom';
import {Accordion, AccordionItem, LayoutModule, PrimaryNavItem, SecondaryNav, TreeView, Typography} from '@jahia/moonstone';
import {registerRoute, registerRouteLv2} from './Administration.route';
import {useTranslation} from 'react-i18next';
import Server from '@jahia/moonstone/dist/icons/Server';
import Setting from '@jahia/moonstone/dist/icons/Setting';
import SiteWeb from '@jahia/moonstone/dist/icons/SiteWeb';
import constants from './Administration.constants';
import {Route, Switch} from 'react-router';
import AdminIframe from './AdministrationIframe';
import SiteIframe from './SiteIframe';
import {loadNamespace} from './Administration.loadNamespace';

const AdministrationGroup = () => {
    const history = useHistory();
    const {t} = useTranslation('jahia-administration');
    return (
        <PrimaryNavItem key={constants.DEFAULT_ROUTE}
                        isSelected={history.location.pathname.startsWith(constants.DEFAULT_ROUTE)}
                        label={t('jahia-administration.label')}
                        icon={<Setting/>}
                        onClick={() => history.push(`${constants.DEFAULT_ROUTE}/aboutJahia`)}/>
    );
};

const Administration = () => {
    const history = useHistory();
    const loadingNamespace = loadNamespace('jahia-administration');

    if (loadingNamespace) {
        return 'Loading screen';
    }

    const routes = [];
    const dataServer = [];
    const dataSites = [];
    let createTreeStructureAndAggregateRoutes = function (currentLevelRoute, parent, registryTargetParent) {
        currentLevelRoute.forEach(route => {
            let treeEntry = {
                id: route.label.toLowerCase().replace(' ', ''),
                label: route.label,
                isSelectable: route.isSelectable,
                children: []
            };
            if (route.icon !== null) {
                treeEntry.iconStart = route.icon;
            }

            if (route.childrenTarget !== null) {
                createTreeStructureAndAggregateRoutes(registry.find({
                    type: 'route',
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
        type: 'route',
        target: 'administration-server'
    }), dataServer, 'administration-server');

    createTreeStructureAndAggregateRoutes(registry.find({
        type: 'route',
        target: 'administration-sites'
    }), dataSites, 'administration-sites');

    console.log('Administration routes', routes);

    let getSelectedItems = function () {
        let selectedItems = [];
        let split = history.location.pathname.split('/');
        selectedItems.push(split.pop().toLowerCase());
        console.log(selectedItems);
        return selectedItems;
    };

    let getOpenedByDefault = function () {
        let selectedItem = getSelectedItems()[0];
        if (dataServer.find(leaf => {
            return leaf.id === selectedItem;
        }) !== undefined) {
            console.log('returning server');
            return 'server';
        }

        if (dataSites.find(leaf => {
            return leaf.id === selectedItem;
        }) !== undefined) {
            console.log('returning server');
            return 'sites';
        }

        return '';
    };

    return (
        <LayoutModule
            navigation={
                <SecondaryNav header={<Typography variant="section">Administration</Typography>}>
                    <Accordion openByDefault={getOpenedByDefault()}>
                        <AccordionItem id="server" label="Server" icon={<Server/>}>
                            <TreeView data={dataServer}
                                      selectedItems={getSelectedItems()}
                                      openedItems={getSelectedItems()}
                                      onClick={elt => history.push(elt.route)}/>
                        </AccordionItem>
                        <AccordionItem id="sites" label="Sites" icon={<SiteWeb/>}>
                            <TreeView data={dataSites}
                                      selectedItems={getSelectedItems()}
                                      openedItems={getSelectedItems()}
                                      onClick={elt => history.push(elt.route.replace(':siteKey', window.contextJsParameters.siteKey))}/>
                        </AccordionItem>
                    </Accordion>
                </SecondaryNav>
            }
            content={
                <Switch>
                    {routes.map(r =>
                        <Route key={r.key} path={r.path} render={r.render}/>
                    )}
                </Switch>
            }
        />
    );
};

export const registerAdministration = () => {
    registerRoute(<Administration/>);
    registerRouteLv2('server', <AdminIframe route="aboutJahia"/>, 'aboutJahia', 'About Jahia', null);
    registerRouteLv2('server', null, 'configuration', 'Configuration', null, '', 1, 'configuration', false);
    registerRouteLv2('server', null, 'systemHealth', 'System Health', null, '', 2, 'systemhealth', false);
    registerRouteLv2('server', <AdminIframe route="systemInfos"/>, 'systemInfos', 'System Infos', null, 'systemhealth');
    registerRouteLv2('sites', <SiteIframe route="manageModules"/>, ':siteKey/manageModules', 'Modules', null);
    registry.add('administrationGroupItem', {
        type: 'bottomAdminGroup',
        target: ['nav-root-bottom:1'],
        render: () => <AdministrationGroup/>
    });
};

