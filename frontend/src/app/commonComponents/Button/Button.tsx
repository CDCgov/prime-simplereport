import React from "react";
import classnames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../../../styles/fontAwesome";

interface Props {
  type?: "button" | "submit";
  icon?: any;
  label?: string;
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
}

const Button = ({
  type = "button",
  icon,
  disabled,
  label,
  children,
  variant,
  className,
  onClick,
  id,
}: Props) => (
  <button
    type={type}
    disabled={disabled}
    className={classnames(
      "usa-button",
      variant && `usa-button--${variant}`,
      disabled && "usa-button-disabled",
      className
    )}
    id={id}
    onClick={onClick}
  >
    {icon && <FontAwesomeIcon icon={icon} className="margin-right-1" />}
    {label || children}
  </button>
);

export default Button;
