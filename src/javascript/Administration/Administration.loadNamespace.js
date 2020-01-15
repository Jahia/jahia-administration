/* eslint-disable */

import {useState, useEffect} from 'react';
import {useTranslation} from 'react-i18next';

export const loadNamespace = namespace => {
    const {i18n} = useTranslation();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        i18n.loadNamespaces(namespace)
            .then(() => setLoading(false));
    }, [i18n, namespace]);

    return loading;
};
