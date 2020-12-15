import React from "react";
import classnames from "classnames";
import PropTypes from "prop-types";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../../styles/fontAwesome";

const Button = ({
  onClick,
  type,
  icon,
  disabled,
  big,
  secondary,
  inverse,
  secondaryInverse,
  secondaryDisabled,
  label,
  outline,
  unstyled = false,
  addClass,
}) => {
  let classNames = classnames(
    {
      "usa-button": true,
      "usa-button-big": big,
      "usa-button--unstyled": unstyled,
      "usa-button--secondary": secondary,
      "usa-button--secondary-inverse": secondaryInverse,
      "use-button--inverse": inverse,
      "usa-button--outline": outline,
      "usa-button-disabled": disabled,
      "usa-button-secondary-disabled": secondaryDisabled,
    },
    addClass
  );

  const buttonIcon = !icon ? null : <FontAwesomeIcon icon={icon} />;

  if (icon) {
    classNames += " prime-button--icon";
  }

  return (
    <button
      className={classNames}
      onClick={onClick}
      type={type || "button"}
      disabled={disabled}
    >
      {buttonIcon}
      {label}
    </button>
  );
};

Button.propTypes = {
  onClick: PropTypes.func,
  type: PropTypes.oneOf(["submit", "reset", "button"]),
  icon: PropTypes.string,
  disabled: PropTypes.bool,
  big: PropTypes.bool,
  secondary: PropTypes.bool,
  inverse: PropTypes.bool,
  secondaryInverse: PropTypes.bool,
  secondaryDisabled: PropTypes.bool,
  label: PropTypes.string,
  outline: PropTypes.bool,
  addClass: PropTypes.string,
};

export default Button;
