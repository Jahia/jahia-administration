import React from 'react';
import {useQuery} from 'react-apollo';
import {SitesQuery} from './SiteSwitcher.gql-querys';
import {Dropdown} from '@jahia/moonstone';
import {useDispatch, useSelector} from 'react-redux';
import {registry} from '@jahia/ui-extender';
import styles from './SiteSwitcher.scss';
import {useHistory, useLocation} from 'react-router-dom';

const SiteSwitcher = () => {
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

    function handleOnChange(e, item) {
        if (location.pathname.indexOf('/' + current.site + '/') >= 0) {
            history.push(location.pathname.replace('/' + current.site + '/', '/' + item.name + '/'));
        }

        dispatch(registry.get('redux-reducer', 'site').actions.setSite(item.name));
        if (item.languages.indexOf(current.language) < 0) {
            dispatch(registry.get('redux-reducer', 'language').actions.setLanguage(item.defaultLanguage));
        }
    }

    if (loading) {
        return null;
    }

    const dropdown = (loading) ? null : (
        <Dropdown
            label={data.jcr.result.nodes.find(site => site.name === current.site).displayName}
            value={current.site}
            className={styles.siteSwitcher}
            data={data.jcr.result.nodes.filter(s => {
                return s.hasPermission;
            }).sort().map(s => ({
                label: s.displayName,
                value: s.path,
                name: s.name,
                defaultLanguage: s.defaultLanguage.value,
                languages: s.languages.values
            }))}
            onChange={(e, item) => handleOnChange(e, item)}
        />
    );
    return dropdown;
};

export default SiteSwitcher;
