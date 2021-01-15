import React from "react";

const DatePicker = () => (
  <div className="usa-form-group">
    <label className="usa-label" id="symptom-date-label" htmlFor="symptom-date">Date of symptom onset</label>
    <div className="usa-hint" id="symptom-date-hint">mm/dd/yyyy</div>
    <div className="usa-date-picker">
      <input 
        className="usa-input" 
        id="symptom-date" 
        name="symptom-date" 
        type="text" 
        aria-describedby="symptom-date-label symptom-date-hint"
      />
    </div>
  </div>
);

export default DatePicker;
