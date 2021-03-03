import React from "react";

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

interface Props {
  type: "info" | "success" | "warning" | "error";
  role?: "alert" | "alertdialog" | "region";
  title: React.ReactNode;
  body?: React.ReactNode;
  children?: React.ReactNode;
}
const Alert = ({ type, title, body, role, children }: Props) => (
  <div
    className={`usa-alert usa-alert--${type}`}
    // eslint-disable-next-line jsx-a11y/aria-props
    aria-role={role ? role : type === "error" ? "alert" : "region"}
  >
    <div className="usa-alert__body">
      <h3 className="usa-alert__heading">{title}</h3>
      <div className="usa-alert__text">{body || children}</div>
    </div>
  </div>
);

export default Alert;
