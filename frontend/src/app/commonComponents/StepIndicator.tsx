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
  segmentIndicatorOnBottom?: boolean;
}

const StepIndicator = ({
  steps,
  currentStepValue,
  noLabels,
  segmentIndicatorOnBottom = false,
}: Props): React.ReactElement => {
  const currentStep = steps.find(({ value }) => value === currentStepValue) || {
    order: 0,
    label: "",
  };

  const SegmentsIndicator = () => (
    <ol
      className={classnames("usa-step-indicator__segments", {
        "margin-top-1": segmentIndicatorOnBottom,
      })}
    >
      {steps.map((step) => (
        <li
          key={step.value}
          className={classnames("usa-step-indicator__segment", {
            "usa-step-indicator__segment--current":
              step.value === currentStepValue,
            "usa-step-indicator__segment--complete":
              currentStep.order > step.order,
          })}
          aria-current={step.value === currentStepValue}
        >
          <span className="usa-step-indicator__segment-label">
            {step.label} <span className="usa-sr-only">completed</span>
          </span>
        </li>
      ))}
    </ol>
  );

  const StepNameAndCount = () => (
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
  );

  return (
    <div
      className={classnames(
        `usa-step-indicator usa-step-indicator--counters-sm`,
        {
          "usa-step-indicator--no-labels": noLabels,
          "margin-y-205": !segmentIndicatorOnBottom,
        }
      )}
      aria-label="progress"
    >
      {segmentIndicatorOnBottom ? (
        <>
          <StepNameAndCount />
          <SegmentsIndicator />
        </>
      ) : (
        <>
          <SegmentsIndicator />
          <StepNameAndCount />
        </>
      )}
    </div>
  );
};

export default StepIndicator;
