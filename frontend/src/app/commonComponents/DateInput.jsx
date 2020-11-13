import React from "react";
import PropTypes from "prop-types";
import { v4 as uuidv4 } from "uuid";

const DateInput = ({
  values,
  label,
  legend,
  hint,
  names,
  onChange,
  disabled,
}) => {
  let dayId = uuidv4();
  let monthId = uuidv4();
  let yearId = uuidv4();

  return (
    <React.Fragment>
      <fieldset className="usa-fieldset">
        <legend className="usa-legend">{legend}</legend>
        <span className="usa-hint" id="dobHint">
          {hint}
        </span>
        <div className="usa-memorable-date">
          <div className="usa-form-group usa-form-group--month">
            <label className="usa-label" htmlFor={dayId}>
              Month
            </label>
            <input
              aria-describedby="dobHint"
              className="usa-input usa-input--inline"
              id={dayId}
              name={names.day}
              type="text"
              maxLength="2"
              step="1"
              min="0"
              max="31"
              pattern="[0-9]*"
              inputMode="numeric"
              value={values.day}
              disabled={disabled}
            />
          </div>
          <div className="usa-form-group usa-form-group--day">
            <label className="usa-label" htmlFor={monthId}>
              Day
            </label>
            <input
              className="usa-input usa-input--inline"
              aria-describedby="dobHint"
              id={monthId}
              name={names.month}
              type="text"
              maxLength="2"
              pattern="[0-9]*"
              inputMode="numeric"
              value={values.month}
              disabled={disabled}
            />
          </div>
          <div className="usa-form-group usa-form-group--year">
            <label className="usa-label" htmlFor={yearId}>
              Year
            </label>
            <input
              className="usa-input usa-input--inline"
              aria-describedby="dobHint"
              id={yearId}
              name={names.year}
              type="text"
              minLength="4"
              maxLength="4"
              pattern="[0-9]*"
              inputMode="numeric"
              value={values.year}
              disabled={disabled}
            />
          </div>
        </div>
      </fieldset>
    </React.Fragment>
  );
};

DateInput.propTypes = {
  legend: PropTypes.string,
  hint: PropTypes.string,
  //   values: PropTypes.string,
  label: PropTypes.string,
  //   names: PropTypes.string,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
};

export default DateInput;
