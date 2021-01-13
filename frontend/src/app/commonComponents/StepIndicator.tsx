import React from "react";

const StepIndicator = () => (
  <div
    className="usa-step-indicator usa-step-indicator--counters-sm margin-y-205"
    aria-label="progress"
  >
    <ol className="usa-step-indicator__segments">
      <li className="usa-step-indicator__segment usa-step-indicator__segment--complete">
        <span className="usa-step-indicator__segment-label">
          Profile information <span className="usa-sr-only">completed</span>
        </span>
      </li>
      <li
        className="usa-step-indicator__segment usa-step-indicator__segment--current"
        aria-current="true"
      >
        <span className="usa-step-indicator__segment-label">
          Symptoms and history <span className="usa-sr-only">completed</span>
        </span>
      </li>
    </ol>
    <div className="usa-step-indicator__header">
      <h1 className="usa-step-indicator__heading">
        <span className="usa-step-indicator__heading-counter">
          <span className="usa-sr-only">Step</span>
          <span className="usa-step-indicator__current-step margin-right-05">
            2
          </span>
          <span className="usa-step-indicator__total-steps">of 2</span>
        </span>
        <span className="usa-step-indicator__heading-text">
          Symptoms and history
        </span>
      </h1>
    </div>
  </div>
);

export default StepIndicator;
