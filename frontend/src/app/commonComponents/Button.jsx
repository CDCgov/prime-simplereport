import React from "react";
import classnames from "classnames";
import PropTypes from "prop-types";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../../styles/fontAwesome";

export default class Button extends React.Component {
  static propTypes = {
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

  render() {
    let classNames = classnames(
      {
        "usa-button": true,
        "usa-button-big": this.props.big,
        "usa-button--secondary": this.props.secondary,
        "usa-button--secondary-inverse": this.props.secondaryInverse,
        "usa-button--outline": this.props.outline,
        "usa-button-disabled": this.props.disabled,
        "usa-button-secondary-disabled": this.props.secondaryDisabled,
      },
      this.props.addClass
    );

    const icon = !this.props.icon ? null : (
      <FontAwesomeIcon icon={this.props.icon} />
    );

    if (this.props.icon) {
      classNames += " prime-button--icon";
    }

    return (
      <button
        className={classNames}
        onClick={this.props.onClick}
        type={this.props.type || "button"}
        disabled={this.props.disabled}
      >
        {icon}
        {this.props.label}
      </button>
    );
  }
}
