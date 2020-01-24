import Iframe from 'react-iframe';
import PropTypes from 'prop-types';
import React from 'react';

let path = endPath => {
    return `/cms/adminframe/default/${window.contextJsParameters.locale}/sites/${window.contextJsParameters.siteKey}.${endPath}.html`;
};

export const SiteIframe = ({route}) => (
    <Iframe url={window.contextJsParameters.contextPath + path(route)} width="100%" height="100%"/>
);

SiteIframe.defaultProps = {
    route: ''
};

SiteIframe.propTypes = {
    route: PropTypes.string
};

export default SiteIframe;
