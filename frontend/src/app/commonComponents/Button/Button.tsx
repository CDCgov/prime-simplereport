import React from "react";
import classnames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../../../styles/fontAwesome";

interface Props {
  type?: "button" | "submit";
  icon?: any;
  label?: string;
  ariaDescribedBy?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  variant?:
    | "accent-cool"
    | "accent-warm"
    | "base"
    | "big"
    | "inverse"
    | "outline"
    | "unstyled"
    | "secondary";
  className?: string;
  id?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  ariaHidden?: boolean;
  ariaLabel?: string;
  ref?: React.RefObject<HTMLButtonElement> | null;
}

const Button = ({
  type = "button",
  icon,
  disabled,
  label,
  ariaDescribedBy,
  children,
  variant,
  className,
  onClick,
  id,
  ariaHidden,
  ariaLabel,
}: Props) => (
  <button
    type={type}
    disabled={disabled}
    aria-disabled={disabled}
    aria-hidden={ariaHidden}
    className={classnames(
      "usa-button",
      variant && `usa-button--${variant}`,
      disabled && "usa-button-disabled",
      className
    )}
    id={id}
    onClick={onClick}
    aria-describedby={ariaDescribedBy || undefined}
    aria-label={ariaLabel}
  >
    {icon && <FontAwesomeIcon icon={icon} className="margin-right-1" />}
    {label || children}
  </button>
);

export default Button;
