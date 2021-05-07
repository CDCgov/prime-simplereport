import React from "react";
import classnames from "classnames";

interface Props {
  steps: {
    label: string;
    value: string;
    order: number;
  }[];
  currentStepValue: string;
  noLabels?: boolean;
}

const StepIndicator = ({
  steps,
  currentStepValue,
  noLabels,
}: Props): React.ReactElement => {
  const currentStep = steps.find(({ value }) => value === currentStepValue) || {
    order: 0,
    label: "",
  };

  let noLabelsClass = "";
  if (noLabels) {
    noLabelsClass = "usa-step-indicator--no-labels";
  }

  return (
    <div
      className={`usa-step-indicator ${noLabelsClass} usa-step-indicator--counters-sm margin-y-205`}
      aria-label="progress"
    >
      <ol className="usa-step-indicator__segments">
        {steps.map((step) => (
          <li
            key={step.value}
            className={classnames(
              "usa-step-indicator__segment",
              step.value === currentStepValue &&
                "usa-step-indicator__segment--current",
              currentStep.order > step.order &&
                "usa-step-indicator__segment--complete"
            )}
            aria-current={step.value === currentStepValue}
          >
            <span className="usa-step-indicator__segment-label">
              {step.label} <span className="usa-sr-only">completed</span>
            </span>
          </li>
        ))}
      </ol>
      <div className="usa-step-indicator__header">
        <h1 className="usa-step-indicator__heading">
          <span className="usa-step-indicator__heading-counter">
            <span className="usa-sr-only">Step</span>
            <span className="usa-step-indicator__current-step margin-right-05">
              {currentStep.order + 1}
            </span>
            <span className="usa-step-indicator__total-steps">
              of {steps.length}
            </span>
          </span>
          <span className="usa-step-indicator__heading-text">
            {currentStep.label}
          </span>
        </h1>
      </div>
    </div>
  );
};

export default StepIndicator;
