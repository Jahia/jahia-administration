import {createActions, handleActions} from 'redux-actions';
import {batch} from 'react-redux';
import {registry} from '@jahia/ui-extender';
import {combineReducers} from 'redux';

export const {adminSetPath, adminSetSites} = createActions('ADMIN_SET_PATH', 'ADMIN_SET_SITES');

const extractParamsFromUrl = pathname => {
    if (pathname.startsWith('/administration/')) {
        let [, ...pathElements] = pathname.split('/');

        let path = ('/' + pathElements.join('/'));

        path = decodeURIComponent(path);
        return {path};
    }

    return {path: ''};
};

const select = state => {
    let {router: {location: {pathname}}, administration: {path}} = state;
    return {
        pathname,
        path
    };
};

let currentValue;
let getSyncListener = store => () => {
    setTimeout(() => {
        let previousValue = currentValue || {};
        currentValue = select(store.getState());
        if (currentValue.pathname.startsWith('/administration/') && previousValue.pathname !== undefined && previousValue.pathname.startsWith('/administration/')) {
            let currentValueFromUrl = extractParamsFromUrl(currentValue.pathname);
            if (previousValue.pathname !== currentValue.pathname) {
                let data = {};
                Object.assign(data,
                    currentValueFromUrl.path === previousValue.path ? {} : {path: currentValueFromUrl.path}
                );
                store.dispatch(dispatch => batch(() => {
                    if (data.path) {
                        dispatch(adminSetPath(data.path));
                    }
                }));
            }
        }
    });
};

export const administrationRedux = () => {
    const jahiaCtx = window.contextJsParameters;
    const pathName = window.location.pathname.substring((jahiaCtx.contextPath + jahiaCtx.urlbase).length);
    const currentValueFromUrl = extractParamsFromUrl(pathName);
    const pathReducer = handleActions({
        [adminSetPath]: (state, action) => action.payload
    }, currentValueFromUrl.path);
    const sitesReducer = handleActions({
        [adminSetSites]: (state, action) => action.payload
    }, []);

    registry.add('redux-reducer', 'administration', {
        targets: ['root'],
        reducer: combineReducers({path: pathReducer, sites: sitesReducer}),
        actions: {adminSetSites}
    });
    registry.add('redux-listener', 'administration', {targets: ['root'], createListener: getSyncListener});
};
