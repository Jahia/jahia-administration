import Iframe from 'react-iframe';
import PropTypes from 'prop-types';
import React from 'react';

let path = endPath => {
    return `/cms/adminframe/default/${window.contextJsParameters.locale}/settings.${endPath}.html?redirect=false`;
};

export const AdminIframe = ({route}) => (
    <Iframe url={window.contextJsParameters.contextPath + path(route)} width="100%" height="100%"/>
);

AdminIframe.defaultProps = {
    route: ''
};

AdminIframe.propTypes = {
    route: PropTypes.string
};

export default AdminIframe;
