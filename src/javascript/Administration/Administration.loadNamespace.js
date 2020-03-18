/* eslint-disable */

import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';

export const loadNamespace = namespace => {
    const {i18n} = useTranslation();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        i18n.loadNamespaces(namespace)
            .then(() => {
                    setLoading(false);
                }
            ).catch((e) => console.error('ADM error loading namespace', namespace, i18n, e));
    }, [i18n, namespace]);

    return loading;
};
