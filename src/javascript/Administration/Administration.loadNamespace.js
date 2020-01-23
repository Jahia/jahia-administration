/* eslint-disable */

import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';

export const loadNamespace = namespace => {
    const {i18n} = useTranslation();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        i18n.loadNamespaces(namespace)
            .then(() => {
                    console.log('ADM loaded namespace', namespace, i18n);
                    setLoading(false);
                }
            ).catch((e) => console.log('ADM error loading namespace', namespace, i18n, e));
    }, [i18n, namespace]);

    return loading;
};
