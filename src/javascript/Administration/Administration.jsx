import React from 'react';
import {registry} from '@jahia/registry';
import {useHistory} from 'react-router-dom';
import {Accordion, AccordionItem, LayoutModule, PrimaryNavItem, SecondaryNav, TreeView, Typography} from '@jahia/moonstone';
import {registerRoute, registerRouteLv2} from './Administration.route';
import {useTranslation} from 'react-i18next';
import Info from '@jahia/moonstone/dist/icons/Info';
import Server from '@jahia/moonstone/dist/icons/Server';
import Setting from '@jahia/moonstone/dist/icons/Setting';
import SiteWeb from '@jahia/moonstone/dist/icons/SiteWeb';
import constants from './Administration.constants';
import {Route, Switch} from 'react-router';
import AdminIframe from './AdministrationIframe';
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
    const routesServer = registry.find({
        type: 'route',
        target: 'administration-server'
    });
    const routesServerSystemHealth = registry.find({
        type: 'route',
        target: 'administration-server-systemhealth'
    });
    routes.push(...routesServer);
    routes.push(...routesServerSystemHealth);
    console.log('Administration routes', routesServer);
    let dataServer = [
        {
            id: 'aboutjahia',
            label: 'About Jahia',
            iconStart: <Info/>,
            route: `${constants.DEFAULT_ROUTE}/aboutJahia`,
            children: []
        },
        {
            id: 'configuration',
            label: 'Configuration',
            isSelectable: false,
            children: []
        },
        {
            id: 'systemhealth',
            label: 'System Health',
            isSelectable: false,
            children: [{
                id: 'systeminfos',
                label: 'System Infos',
                iconStart: <Info/>,
                route: `${constants.DEFAULT_ROUTE}/systemInfos`,
                children: []
            }]
        }
    ];
    let getSelectedItems = function () {
        let selectedItems = [];
        let split = history.location.pathname.split('/');
        selectedItems.push(split.pop().toLowerCase());
        console.log(selectedItems);
        return selectedItems;
    };

    let getOpenedByDefault = function () {
        if (dataServer.find(leaf => {
            console.log('leaf', leaf, getSelectedItems());
            return leaf.id === getSelectedItems()[0];
        }) !== undefined) {
            console.log('returning server');
            return 'server';
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
                        <AccordionItem id="sites" label="Sites" icon={<SiteWeb/>}/>
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
    registerRouteLv2(<AdminIframe route="aboutJahia"/>, 'aboutJahia', null, 'About Jahia', <Info/>);
    registerRouteLv2(<AdminIframe route="systemInfos"/>, 'systemInfos', 'systemhealth', 'System Infos', <Info/>);
    registry.add('administrationGroupItem', {
        type: 'bottomAdminGroup',
        target: ['nav-root-bottom:1'],
        render: () => <AdministrationGroup/>
    });
};

