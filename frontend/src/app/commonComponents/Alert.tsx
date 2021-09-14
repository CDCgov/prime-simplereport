import React from "react";
import classnames from "classnames";

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

export type AlertType = "info" | "success" | "warning" | "error" | "emergency";
export interface AlertContent {
  type: AlertType;
  title: string;
  body: string;
}
interface Props {
  type: AlertType;
  role?: "alert" | "alertdialog" | "region";
  title?: React.ReactNode;
  body?: React.ReactNode;
  children?: React.ReactNode;
  slim?: boolean;
  className?: string;
}
const Alert = ({
  type,
  title,
  body,
  role,
  children,
  slim,
  className,
}: Props) => {
  const classes = classnames(
    "usa-alert",
    `usa-alert--${type}`,
    slim && "usa-alert--slim",
    className
  );

  return (
    <div
      className={classes}
      role={role ? role : type === "error" ? "alert" : "region"}
    >
      <div className="usa-alert__body">
        {title && <h3 className="usa-alert__heading">{title}</h3>}
        <div className="usa-alert__text">{body || children}</div>
      </div>
    </div>
  );
};

export default Alert;
