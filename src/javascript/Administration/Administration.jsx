import React, {useEffect} from 'react';
import {registry} from '@jahia/ui-extender';
import {useAdminRouteTreeStructure} from '@jahia/jahia-ui-root';
import {useHistory} from 'react-router-dom';
import {Accordion, AccordionItem, LayoutModule, SecondaryNav, SecondaryNavHeader, TreeView} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {Server} from '@jahia/moonstone';
import {SiteWeb} from '@jahia/moonstone';
import constants from './Administration.constants';
import {Route, Switch} from 'react-router';
import {useNodeInfo} from '@jahia/data-helper';
import {batch, useDispatch, useSelector} from 'react-redux';
import SiteSwitcher from './SiteSwitcher/SiteSwitcher';
import PropTypes from 'prop-types';
import AdministrationEmpty from './Administration.empty';

let current;
let dispatch;

const getRegistryTarget = function (item, target) {
    const foundTarget = item.targets.find(t => t.id === target || t.id.startsWith(target + '-'));
    return foundTarget.id + ':' + foundTarget.priority;
};

const administrationMessageListener = event => {
    if (event.origin !== window.location.origin) {
        return;
    }

    if (event.data !== null && event.data.msg !== null) {
        if (event.data.msg === 'updatedSitesList') {
            let sites = event.data.sites;
            if (!sites.find(site => site === current.site)) {
                dispatch(registry.get('redux-reducer', 'site').actions.setSite((event.data.defaultSite === undefined ? 'systemsite' : event.data.defaultSite)));
            }
        }
    }
};

const useTree = ({target, nodePath, mainPermission, selectedItem}) => {
    const {t} = useTranslation();
    const {routes, tree, allPermissions, defaultOpenedItems} = useAdminRouteTreeStructure(target, selectedItem);
    const {node, loading, error} = useNodeInfo({
        path: nodePath
    }, {
        getPermissions: [mainPermission, ...allPermissions],
        getSiteInstalledModules: true,
        getSiteLanguages: true
    });

    if (loading || error) {
        return {loading, error};
    }

    if (!node || !node[mainPermission]) {
        return {
            allowed: false
        };
    }

    const data = tree
        .filter(route => route.requiredPermission === undefined || node[route.requiredPermission] !== false)
        .filter(route => route.requireModuleInstalledOnSite === undefined || node.site.installedModulesWithAllDependencies.indexOf(route.requireModuleInstalledOnSite) > -1)
        .filter(route => !route.routeOnly)
        .map(route => ({
            id: route.key,
            label: t(route.label),
            isSelectable: route.isSelectable,
            iconStart: route.icon,
            treeItemProps: {
                'data-sel-role': route.key,
                'data-registry-key': route.type + ':' + route.key,
                'data-registry-target': getRegistryTarget(route, target)
            }
        }))
        .getData();

    const filteredRoutes = routes && routes
        .filter(route => route.requiredPermission === undefined || (node && (node[route.requiredPermission] !== false)))
        .filter(route => route.isSelectable && route.render);

    return {
        allowed: true,
        data,
        defaultOpenedItems,
        filteredRoutes,
        defaultLanguage: (node.site === undefined ? undefined : node.site.defaultLanguage),
        languages: (node.site === undefined ? undefined : node.site.languages.filter(item => item.activeInEdit).map(item => item.language))
    };
};

function getSelectedItem(param) {
    let item = param.substr(1);
    if (registry.get('adminRoute', item)) {
        while (registry.get('adminRoute', item).routeOnly && item.indexOf('/') > 0) {
            item = item.substr(0, item.lastIndexOf('/'));
        }

        return {serverSelectedItem: item};
    }

    const spl = param.split('/').slice(1);
    let site = spl[0];
    item = spl.slice(1).join('/');
    if (registry.get('adminRoute', item)) {
        while (registry.get('adminRoute', item).routeOnly && item.indexOf('/') > 0) {
            item = item.substr(0, item.lastIndexOf('/'));
        }

        return {site, siteSelectedItem: item};
    }

    return {};
}

const Administration = ({match}) => {
    const {t} = useTranslation();
    const history = useHistory();

    current = useSelector(state => ({
        site: state.site,
        language: state.language
    }));
    dispatch = useDispatch();

    let param = match.params[0];
    const {site, serverSelectedItem, siteSelectedItem} = getSelectedItem(param);

    const serverResult = useTree({
        target: 'administration-server',
        mainPermission: 'administrationAccess',
        selectedItem: serverSelectedItem,
        nodePath: '/'
    });
    const sitesResult = useTree({
        target: 'administration-sites',
        mainPermission: 'siteAdministrationAccess',
        selectedItem: siteSelectedItem,
        nodePath: '/sites/' + current.site
    });

    useEffect(() => {
        batch(() => {
            if (site !== undefined && site !== current.site) {
                dispatch(registry.get('redux-reducer', 'site').actions.setSite(site));
            }

            if (sitesResult.languages !== undefined && sitesResult.languages.indexOf(current.language) < 0) {
                dispatch(registry.get('redux-reducer', 'language').actions.setLanguage(sitesResult.defaultLanguage));
            }
        });

        window.addEventListener('message', administrationMessageListener, false);

        return () => {
            window.removeEventListener('message', administrationMessageListener, false);
        };
    });

    if (serverResult.loading || sitesResult.loading || serverResult.error || sitesResult.error || (!serverResult.allowed && !sitesResult.allowed)) {
        return null;
    }

    const accordionOpenTab = siteSelectedItem || !serverResult.allowed ? constants.ACCORDION_TABS.SITE : constants.ACCORDION_TABS.SERVER;
    return (
        <LayoutModule
            navigation={
                <SecondaryNav header={<SecondaryNavHeader>{t('jahia-administration:jahia-administration.label')}</SecondaryNavHeader>}>
                    <Accordion isReversed defaultOpenedItem={accordionOpenTab}>
                        {serverResult.allowed &&
                        <AccordionItem id={constants.ACCORDION_TABS.SERVER}
                                       label={t('jahia-administration:jahia-administration.server')}
                                       icon={<Server/>}
                        >
                            <TreeView isReversed
                                      data={serverResult.data}
                                      selectedItems={serverSelectedItem ? [serverSelectedItem] : []}
                                      defaultOpenedItems={serverResult.defaultOpenedItems}
                                      onClickItem={
                                          (elt, event, toggleNode) => (
                                              elt.isSelectable ?
                                                  history.push('/administration/' + elt.id) :
                                                  toggleNode(event))
                                      }/>
                        </AccordionItem>}
                        {sitesResult.allowed &&
                        <AccordionItem id={constants.ACCORDION_TABS.SITE}
                                       label={t('jahia-administration:jahia-administration.sites')}
                                       icon={<SiteWeb/>}
                        >
                            <SiteSwitcher selectedItem={siteSelectedItem} availableRoutes={sitesResult.filteredRoutes}/>
                            <TreeView isReversed
                                      data={sitesResult.data}
                                      selectedItems={siteSelectedItem ? [siteSelectedItem] : []}
                                      defaultOpenedItems={sitesResult.defaultOpenedItems}
                                      onClickItem={
                                          (elt, event, toggleNode) => (
                                              elt.isSelectable ?
                                                  history.push('/administration/' + current.site + '/' + elt.id) :
                                                  toggleNode(event))
                                      }/>
                        </AccordionItem>}
                    </Accordion>
                </SecondaryNav>
            }
            content={
                <Switch>
                    {serverResult.allowed && serverResult.filteredRoutes.map(r =>
                        <Route key={r.key} exact strict path={'/administration/' + r.key} render={props => r.render(props)}/>
                    )}
                    {sitesResult.allowed && sitesResult.filteredRoutes.map(r =>
                        <Route key={r.key} exact strict path={'/administration/:site/' + r.key} render={props => r.render(props)}/>
                    )}
                    <Route exact strict path="/administration" component={AdministrationEmpty}/>
                </Switch>
            }
        />
    );
};

Administration.propTypes = {
    match: PropTypes.object.isRequired
};

export default Administration;
