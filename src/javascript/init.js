import {registry} from '@jahia/ui-extender';
import register from './Administration.register';

export default function () {
    registry.add('callback', 'jahiaAdministration', {
        targets: ['jahiaApp-init:2'],
        callback: register
    });
}
