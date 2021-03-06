import {createActions, handleActions} from 'redux-actions';
import {registry} from '@jahia/ui-extender';
import {combineReducers} from 'redux';

export const {adminSetPath} = createActions('ADMIN_SET_PATH');

const extractParamsFromUrl = pathname => {
    if (pathname.startsWith('/administration/')) {
        let [, ...pathElements] = pathname.split('/');

        let path = ('/' + pathElements.join('/'));

        path = decodeURIComponent(path);
        return {path};
    }

    return {path: ''};
};

export const administrationRedux = () => {
    const jahiaCtx = window.contextJsParameters;
    const pathName = window.location.pathname.substring((jahiaCtx.contextPath + jahiaCtx.urlbase).length);
    const currentValueFromUrl = extractParamsFromUrl(pathName);
    const pathReducer = handleActions({
        [adminSetPath]: (state, action) => action.payload,
        '@@router/LOCATION_CHANGE': (state, action) => action.payload.location.pathname.startsWith('/administration') ? extractParamsFromUrl(action.payload.location.pathname).path : state
    }, currentValueFromUrl.path);

    registry.add('redux-reducer', 'administration', {
        targets: ['root'],
        reducer: combineReducers({path: pathReducer})
    });
};
