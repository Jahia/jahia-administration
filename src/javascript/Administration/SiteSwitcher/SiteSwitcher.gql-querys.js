import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

const SitesQuery = gql`
    query SitesQuery($displayLanguage:String!) {
        jcr(workspace: EDIT) {
            result:nodesByCriteria(criteria: {nodeType: "jnt:virtualsite", paths: ["/sites"]}, fieldSorter:{fieldName:"displayName"}) {
                nodes {
                    ...NodeCacheRequiredFields
                    name
                    displayName(language: $displayLanguage)
                    hasPermission(permissionName: "siteAdministrationAccess")
                    path
                    defaultLanguage:property(name:"j:defaultLanguage"){
                        value
                    }
                    languages:property(name:"j:languages"){
                        values
                    }
                }
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;

export {SitesQuery};
