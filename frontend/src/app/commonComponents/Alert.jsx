import React from "react";
import PropTypes from "prop-types";

/**
 * Provides one of four standard alert types.
 * An alert consists of a box with a light background color,
 * an icon, a headline, and a short explanation.
 *
 * The alert type determines the background color and icon displayed
 *
 * Alert types are 'success', 'warning', 'error', 'info'
 *
 * If the type is 'error' and no role is specified, role defaults to 'alert'
 *
 * @returns {node} the rendered DOM node
 * @param {string} type  Sets the alert type if no status is given
 * @param {string} title Text for the headline
 * @param {node} body  Text for the description
 * @param {string} role  ARIA role type
 */

const TYPE_INFO = "info";
const TYPE_SUCCESS = "success";
const TYPE_ERROR = "error";
const TYPE_WARNING = "warning";
const ROLE_ALERT = "alert";
const ROLE_ALERTDIALOG = "alertdialog";
const ROLE_REGION = "region";

const Alert = ({ type, title, body, role, children }) => {
  const getRole = () => {
    return role !== undefined
      ? role
      : type === TYPE_ERROR
      ? ROLE_ALERT
      : ROLE_REGION;
  };

  return (
    <div className={`pin-bottom position-fixed usa-alert usa-alert--${type}`} role={getRole()}>
      <div className="usa-alert__body">
        <h3 className="usa-alert__heading">{title}</h3>
        <div className="usa-alert__text">{body}</div>
        <div className="">{children}</div>
      </div>
    </div>
  );
};

Alert.propTypes = {
  type: PropTypes.oneOf([TYPE_INFO, TYPE_SUCCESS, TYPE_ERROR, TYPE_WARNING]),
  title: PropTypes.string.isRequired,
  body: PropTypes.node.isRequired,
  role: PropTypes.oneOf([ROLE_ALERT, ROLE_ALERTDIALOG]),
};

export default Alert;
