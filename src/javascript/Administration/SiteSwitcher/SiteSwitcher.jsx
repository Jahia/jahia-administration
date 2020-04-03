import React from 'react';
import {useQuery} from 'react-apollo';
import {SitesQuery} from './SiteSwitcher.gql-querys';
import {Dropdown} from '@jahia/moonstone';
import {useDispatch, useSelector} from 'react-redux';
import {registry} from '@jahia/ui-extender';
import styles from './SiteSwitcher.scss';
import {useHistory, useLocation} from 'react-router-dom';

const SiteSwitcher = () => {
    const {loading, refetch, data} = useQuery(SitesQuery, {
        variables: {
            displayLanguage: 'en'
        }
    });
    const current = useSelector(state => ({site: state.site, knownSitesList: state.administration.sites}));
    const dispatch = useDispatch();
    const history = useHistory();
    const location = useLocation();

    function handleOnChange(e, item) {
        history.push(location.pathname.replace('/' + current.site + '/', '/' + item.name + '/'));
        dispatch(registry.get('redux-reducer', 'site').actions.setSite(item.name));
    }

    if (loading) {
        return null;
    }

    // + 1 for system sites as it is not in the list of knownSites
    if ((current.knownSitesList.length > 0) && ((current.knownSitesList.length + 1) !== data.jcr.result.nodes.length)) {
        Promise.all([refetch({
            displayLanguage: 'en'
        })]);
    }

    const dropdown = (loading) ? null : (
        <Dropdown
            label={data.jcr.result.nodes.find(site => site.name === current.site).displayName}
            value={current.site}
            className={styles.siteSwitcher}
            data={data.jcr.result.nodes.filter(s => {
                return s.hasPermission;
            }).sort().map(s => ({label: s.displayName, value: s.path, name: s.name}))}
            onChange={(e, item) => handleOnChange(e, item)}
        />
    );
    return dropdown;
};

export default SiteSwitcher;
