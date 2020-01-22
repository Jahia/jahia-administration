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
import Iframe from 'react-iframe';
import {loadNamespace} from './Administration.loadNamespace';

let endPath = `/${window.contextJsParameters.locale}/settings.aboutJahia.html`;
const ABOUT_FRAME_SRC = `/cms/adminframe/default${endPath}`;

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

    console.log(Accordion, AccordionItem);
    const routesServer = registry.find({
        type: 'route',
        target: 'administration-server'
    });
    let data = [{
        id: 'About',
        label: 'About',
        iconStart: <Info size="small"/>,
        children: []
    }];
    return (
        <LayoutModule
            navigation={
                <SecondaryNav header={<Typography variant="section">Administration</Typography>}>
                    <PrimaryNavItem key={constants.DEFAULT_ROUTE + '/aboutJahia'}
                                    isSelected={history.location.pathname.startsWith(constants.DEFAULT_ROUTE + '/aboutJahia')}
                                    label="About"
                                    icon={<Info/>}
                                    onClick={() => history.push(`${constants.DEFAULT_ROUTE}/aboutJahia`)}/>
                    <Accordion>
                        <AccordionItem id="server" label="Server" icon={<Server/>}>
                            <TreeView data={data}/>
                        </AccordionItem>
                        <AccordionItem id="sites" label="Sites" icon={<SiteWeb/>}/>
                    </Accordion>
                </SecondaryNav>
            }
            content={
                <Switch>
                    {routesServer.map(r =>
                        <Route key={r.key} path={r.path} render={r.render}/>
                    )}
                </Switch>
            }
        />
    );
};

const About = () => {
    return <Iframe url={window.contextJsParameters.contextPath + ABOUT_FRAME_SRC} width="100%" height="100%"/>;
};

export const registerAdministration = () => {
    registerRoute(<Administration/>);
    registerRouteLv2(<About/>);
    registry.add('administrationGroupItem', {
        type: 'bottomAdminGroup',
        target: ['nav-root-bottom:1'],
        render: () => <AdministrationGroup/>
    });
};

