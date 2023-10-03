import React from "react";
import classnames from "classnames";

type Step = {
  label: string;
  value?: string;
  order: number;
};

type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

type SegmentsIndicatorProps = {
  steps: Step[];
  currentStep: Step;
  currentStepValue: string;
  segmentIndicatorOnBottom: boolean;
};
const SegmentsIndicator: React.FC<SegmentsIndicatorProps> = ({
  steps,
  currentStepValue,
  currentStep,
  segmentIndicatorOnBottom,
}) => (
  <div
    className={classnames("usa-step-indicator__segments", {
      "margin-top-1": segmentIndicatorOnBottom,
    })}
    role={"presentation"}
  >
    {steps.map((step) => (
      <div
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
      </div>
    ))}
  </div>
);

type StepNameAndCountProps = {
  HeadingTag: HeadingLevel;
  steps: Step[];
  currentStep: Step;
};

const StepNameAndCount: React.FC<StepNameAndCountProps> = ({
  HeadingTag,
  currentStep,
  steps,
}) => (
  <div className="usa-step-indicator__header">
    <HeadingTag className="usa-step-indicator__heading">
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
    </HeadingTag>
  </div>
);
interface Props {
  steps: Step[];
  currentStepValue: string;
  noLabels?: boolean;
  segmentIndicatorOnBottom?: boolean;
  ariaHidden?: boolean;
  headingLevel?: HeadingLevel;
}

const StepIndicator = ({
  steps,
  currentStepValue,
  noLabels,
  segmentIndicatorOnBottom = false,
  ariaHidden,
  headingLevel = "h1",
}: Props): React.ReactElement => {
  const currentStep = steps.find(({ value }) => value === currentStepValue) || {
    order: 0,
    label: "",
  };

  const HeadingTag = headingLevel;

  return (
    <div
      className={classnames(
        `usa-step-indicator usa-step-indicator--counters-sm`,
        {
          "usa-step-indicator--no-labels": noLabels,
          "margin-y-205": !segmentIndicatorOnBottom,
        }
      )}
      aria-hidden={ariaHidden}
    >
      {segmentIndicatorOnBottom ? (
        <>
          <StepNameAndCount
            HeadingTag={HeadingTag}
            currentStep={currentStep}
            steps={steps}
          />
          <SegmentsIndicator
            currentStep={currentStep}
            steps={steps}
            segmentIndicatorOnBottom={segmentIndicatorOnBottom}
            currentStepValue={currentStepValue}
          />
        </>
      ) : (
        <>
          <SegmentsIndicator
            currentStep={currentStep}
            steps={steps}
            segmentIndicatorOnBottom={segmentIndicatorOnBottom}
            currentStepValue={currentStepValue}
          />
          <StepNameAndCount
            HeadingTag={HeadingTag}
            currentStep={currentStep}
            steps={steps}
          />
        </>
      )}
    </div>
  );
};

export default StepIndicator;
