import React from 'react';
import {useQuery} from 'react-apollo';
import {SitesQuery} from './SiteSwitcher.gql-querys';
import {Dropdown} from '@jahia/moonstone';
import {useDispatch, useSelector} from 'react-redux';
import {registry} from '@jahia/ui-extender';
import styles from './SiteSwitcher.scss';
import {useHistory, useLocation} from 'react-router-dom';

const SiteSwitcher = () => {
    const {data} = useQuery(SitesQuery, {
        variables: {
            displayLanguage: 'en'
        }
    });
    const currentSite = useSelector(state => ({site: state.site}));
    const dispatch = useDispatch();
    const history = useHistory();
    const location = useLocation();

    function handleOnChange(e, item) {
        history.push(location.pathname.replace('/' + currentSite.site + '/', '/' + item.name + '/'));
        dispatch(registry.get('redux-reducer', 'site').actions.setSite(item.name));
    }

    const dropdown = (data && data.jcr.result.nodes) ? (
        <Dropdown
            label={data.jcr.result.nodes.find(site => site.name === currentSite.site).displayName}
            value={currentSite.site}
            className={styles.siteSwitcher}
            data={data.jcr.result.nodes.filter(s => {
                return s.hasPermission;
            }).sort().map(s => ({label: s.displayName, value: s.path, name: s.name}))}
            onChange={(e, item) => handleOnChange(e, item)}
        />
    ) : null;
    return dropdown;
};

export default SiteSwitcher;
