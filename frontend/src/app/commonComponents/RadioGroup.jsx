import React from "react";
import PropTypes from "prop-types";
import uniqueId from "react-html-id";

export default class RadioGroup extends React.Component {
  constructor() {
    super();
    uniqueId.enableUniqueIds(this);
  }
  static propTypes = {
    onChange: PropTypes.func,
    buttons: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.string,
        label: PropTypes.string,
        disabled: PropTypes.bool,
      })
    ),
    name: PropTypes.string,
    value: PropTypes.string,
    disabled: PropTypes.bool,
    horizontal: PropTypes.bool,
    label: PropTypes.string,
  };

  render() {
    const radioGroupItems = this.props.buttons.map((button) => (
      <li
        // NOTE:`horizontal` should:
        // only be used for radio buttons with two options. 3 or more should be vertically stacked
        // always fit on one line
        // list Affirmations before negations: IE. Yes before No.
        className={
          this.props.horizontal
            ? "smeqa-radio__container smeqa-radio--horizontal__container"
            : "smeqa-radio__container"
        }
        key={button.value}
      >
        <input
          className="usa-radio__input"
          checked={button.value === this.props.selectedRadio}
          id={this.nextUniqueId()}
          key={button.value}
          name={this.props.name}
          onChange={this.props.onChange}
          type="radio"
          value={button.value}
          disabled={button.disabled || this.props.disabled || false}
        />
        <label className="usa-radio__label" htmlFor={this.lastUniqueId()}>
          {button.label}
        </label>
      </li>
    ));

    return (
      <fieldset className="usa-fieldset">
        <legend className="usa-sr-only">{this.props.legend}</legend>
        <ul
          className={
            this.props.horizontal
              ? "smeqa-radio--horizontal"
              : "usa-list--unstyled"
          }
        >
          {radioGroupItems}
        </ul>
      </fieldset>
    );
  }
}
