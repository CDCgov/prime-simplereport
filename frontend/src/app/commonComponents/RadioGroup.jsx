import React from "react";
import PropTypes from "prop-types";
import { v4 as uuidv4 } from "uuid";

const RadioGroup = ({
  onChange,
  buttons,
  name,
  value,
  disabled,
  horizontal,
  selectedRadio,
  legend,
}) => {
  const radioGroupItems = buttons.map((button) => {
    const uuid = uuidv4();

    return (
      <li
        // NOTE:`horizontal` should:
        // only be used for radio buttons with two options. 3 or more should be vertically stacked
        // always fit on one line
        // list Affirmations before negations: IE. Yes before No.
        className={
          horizontal
            ? "prime-radio__container prime-radio--horizontal__container"
            : "prime-radio__container"
        }
        key={button.value}
      >
        <input
          className="usa-radio__input"
          checked={button.value === selectedRadio}
          id={uuid}
          key={button.value}
          name={name}
          onChange={onChange}
          type="radio"
          value={button.value}
          disabled={button.disabled || disabled || false}
        />
        <label className="usa-radio__label" htmlFor={uuid}>
          {button.label}
        </label>
      </li>
    );
  });

  return (
    <fieldset className="usa-fieldset">
      <legend className="usa-sr-only">{legend}</legend>
      <ul
        className={
          horizontal ? "prime-radio--horizontal" : "usa-list--unstyled"
        }
      >
        {radioGroupItems}
      </ul>
    </fieldset>
  );
};

RadioGroup.propTypes = {
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
  selectedRadio: PropTypes.string,
  legend: PropTypes.string,
};

export default RadioGroup;
