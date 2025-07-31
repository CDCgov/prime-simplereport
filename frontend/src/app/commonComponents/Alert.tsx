import React from "react";
import classnames from "classnames";
import { v4 as uuidv4 } from "uuid";

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
  title?: string;
  body?: React.ReactNode;
  children?: React.ReactNode;
  slim?: boolean;
  className?: string;
  bodyClassName?: string;
  id?: string;
}

const Alert = ({
  type,
  title,
  body,
  role,
  children,
  slim,
  className,
  bodyClassName,
  id,
}: Props) => {
  const classes = classnames(
    "usa-alert",
    `usa-alert--${type}`,
    slim && "usa-alert--slim",
    className
  );

  const bodyClasses = classnames("usa-alert__body", bodyClassName);

  // Decides element's role base on passed props
  const getIdentifiedRole = () => {
    if (role) {
      return role;
    }

    if (type === "error") {
      return "alert";
    }

    return "region";
  };

  const bodyId = id ? id + "-body" : uuidv4();

  return (
    <div
      className={classes}
      id={id ? id : uuidv4()}
      role={getIdentifiedRole()}
      aria-label={title ? `Alert: ${title}` : undefined}
    >
      <div className={bodyClasses}>
        {title && <div className="usa-alert__heading text-bold">{title}</div>}
        <div id={bodyId} className="usa-alert__text">
          {body || children}
        </div>
      </div>
    </div>
  );
};

export default Alert;
