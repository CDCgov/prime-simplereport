import React from "react";
import classnames from "classnames";
interface Props {
  steps: {
    label: string;
    value: string;
    order: number;
    isCurrent: boolean;
  }[];
}

const StepIndicator = ({ steps }: Props): React.ReactElement => {
  const currentStep = steps.find(({ isCurrent }) => isCurrent) || { order: 0, label: ''}

  return (
    <div
      className="usa-step-indicator usa-step-indicator--counters-sm margin-y-205"
      aria-label="progress"
    >
      <ol className="usa-step-indicator__segments">
        {steps.map((step) => (
          <li
            className={classnames(
              "usa-step-indicator__segment",
              step.isCurrent && "usa-step-indicator__segment--current",
              currentStep.order > step.order && "usa-step-indicator__segment--complete"
            )}
            aria-current={step.isCurrent}
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
              { currentStep.order + 1 }
            </span>
            <span className="usa-step-indicator__total-steps">of {steps.length}</span>
          </span>
          <span className="usa-step-indicator__heading-text">
            {currentStep.label}
          </span>
        </h1>
      </div>
    </div>
  );
}

export default StepIndicator;
