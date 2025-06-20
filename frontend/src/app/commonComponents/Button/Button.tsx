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
  dataCy?: string;
  iconClassName?: string;
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
  dataCy,
  iconClassName,
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
    data-cy={dataCy}
  >
    {icon && (
      <FontAwesomeIcon
        icon={icon}
        className={classnames("margin-right-1", iconClassName)}
      />
    )}
    {label || children}
  </button>
);

export default Button;
