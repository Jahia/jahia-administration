import React from 'react';
import {useQuery} from 'react-apollo';
import {SitesQuery} from './SiteSwitcher.gql-querys';
import {Dropdown} from '@jahia/moonstone';
import {useDispatch, useSelector} from 'react-redux';
import {registry} from '@jahia/ui-extender';
import styles from './SiteSwitcher.scss';
import {useHistory, useLocation} from 'react-router-dom';
import PropTypes from 'prop-types';

const SiteSwitcher = ({selectedItem, availableRoutes}) => {
    const current = useSelector(state => ({
        site: state.site,
        uilang: state.uilang,
        language: state.language
    }));
    const {loading, data} = useQuery(SitesQuery, {
        variables: {
            displayLanguage: current.uilang
        },
        fetchPolicy: 'network-only'
    });
    const dispatch = useDispatch();
    const history = useHistory();
    const location = useLocation();

    const fetchRoute = (route, targetSite) => {
        return fetch(route.iframeUrl.replace('/editframe/', '/render/').replace('$site-key', targetSite)
            .replace('$lang', current.language)
            .replace('$ui-lang', current.uiLang));
    };

    const redirectToFirstAccessibleUrl = (index, routes, item) => {
        if (index >= routes.length) {
            history.push('/administration/');
            callDispatch(item);
        } else {
            const route = routes[index];
            fetchRoute(route, item.name).then(result => {
                if (result.ok) {
                    history.push('/administration/' + item.name + '/' + route.key);
                    callDispatch(item);
                } else {
                    redirectToFirstAccessibleUrl(index + 1, routes, item);
                }
            });
        }
    };

    const handleOnChange = item => {
        if (location.pathname.indexOf('/' + current.site + '/') >= 0) {
            const currentRoute = availableRoutes.find(route => route.key === selectedItem);

            if (currentRoute.iframeUrl) {
                const urlToFetch = currentRoute.iframeUrl.replace('editframe', 'render').replace('$site-key', item.name)
                    .replace('$lang', current.language)
                    .replace('$ui-lang', current.uiLang);
                fetch(urlToFetch).then(result => {
                    if (result.ok) {
                        history.push(location.pathname.replace('/' + current.site + '/', '/' + item.name + '/'));
                        callDispatch(item);
                    } else {
                        redirectToFirstAccessibleUrl(0, availableRoutes, item);
                    }
                });
            } else {
                history.push(location.pathname.replace('/' + current.site + '/', '/' + item.name + '/'));
                callDispatch(item);
            }
        } else {
            callDispatch(item);
        }
    };

    const callDispatch = item => {
        dispatch(registry.get('redux-reducer', 'site').actions.setSite(item.name));
        if (item.languages.indexOf(current.language) < 0) {
            dispatch(registry.get('redux-reducer', 'language').actions.setLanguage(item.defaultLanguage));
        }
    };

    let siteNodes = data?.jcr.result?.nodes || [];
    let sites = siteNodes.filter(s => s.hasPermission && s.name !== 'systemsite');
    sites.push(siteNodes.find(s => s.name === 'systemsite')); // Add systemsite to end of list

    return (loading) ? null : (
        <Dropdown
            label={data.jcr.result.nodes.find(site => site.name === current.site).displayName}
            value={current.site}
            className={styles.siteSwitcher}
            data={sites.map(s => ({
                label: s.displayName,
                value: s.path,
                name: s.name,
                defaultLanguage: s.defaultLanguage.value,
                languages: s.languages.values
            }))}
            onChange={(_e, item) => handleOnChange(item)}
        />
    );
};

SiteSwitcher.propTypes = {
    availableRoutes: PropTypes.array.isRequired,
    selectedItem: PropTypes.string.isRequired
};
export default SiteSwitcher;
