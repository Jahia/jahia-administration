import {administrationRedux} from './Administration/Administration.redux';
import {administrationRoutes} from './Administration/Administration.routes';

export default function () {
    window.jahia.i18n.loadNamespaces('jahia-administration');
    administrationRedux();
    administrationRoutes();
}
