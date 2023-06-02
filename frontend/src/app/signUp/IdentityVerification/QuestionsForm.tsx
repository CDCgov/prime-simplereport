import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStopwatch } from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { useFieldArray, useForm } from "react-hook-form";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import RadioGroup from "../../commonComponents/RadioGroup";
import Button from "../../commonComponents/Button/Button";
import Alert from "../../commonComponents/Alert";
import StepIndicator from "../../commonComponents/StepIndicator";
import { organizationCreationSteps } from "../../../config/constants";
import { mmss } from "../../testQueue/TestTimer";
import { useDocumentTitle } from "../../utils/hooks";

import { toOptions } from "./utils";
import "./QuestionsForm.scss";

type QuestionsFormData = {
  experianQuestions: {
    idx: number;
    text: string;
    choices: string[];
    value: string;
  }[];
};

interface QuestionsFormProps {
  questionSet: Question[];
  saving: boolean;
  onSubmit: (answers: Answers) => void;
  onFail: () => void;
  timeToComplete?: number;
  disableTimer?: boolean;
}

const QuestionsForm: React.FC<QuestionsFormProps> = ({
  questionSet,
  saving,
  onSubmit,
  onFail,
  timeToComplete,
  disableTimer,
}) => {
  useDocumentTitle("Sign up - identity verification");

  /**
   * Setup Timer
   */
  // Experian only gives users 5 minutes (300 s) to answer the questions
  // so use this state to display a timer, then redirect to failure page
  // when time is up
  const [timeLeft, setTimeLeft] = useState(timeToComplete || 300);
  useEffect(() => {
    let isCounting = true;

    if (timeLeft === 0) {
      onFail();
    }
    setTimeout(() => {
      if (isCounting && !disableTimer) {
        setTimeLeft(timeLeft - 1);
      }
    }, 1000);
    return () => {
      isCounting = false;
    };
  }, [timeLeft, onFail, disableTimer]);

  /**
   * Setup form
   */
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<QuestionsFormData>({
    defaultValues: {
      experianQuestions: questionSet.map((q, idx) => ({
        text: q.questionText,
        choices: q.questionSelect.questionChoice,
      })),
    },
  });

  const { fields } = useFieldArray({
    control,
    name: "experianQuestions",
  });

  const formCurrentValues = watch();

  /**
   * Submit answers
   */
  const onSubmitAnswers = async (formData: QuestionsFormData) => {
    const answers: Answers = {};
    formData.experianQuestions.forEach(
      (q) => (answers[`answer${q.idx + 1}`] = q.value)
    );
    console.log("form data", formData.experianQuestions);
    await onSubmit(answers as Answers);
  };

  /**
   * HTML
   */
  return (
    <CardBackground>
      <Card logo>
        <div
          className="grid-row prime-test-name usa-card__header"
          id="experian-questions-header"
        >
          <h1 className="margin-left-0">Sign up for SimpleReport</h1>
          <div
            className="timer-button timer-running"
            data-testid="timer"
            tabIndex={-1}
            role="timer"
          >
            <span>{mmss(timeLeft)}</span>{" "}
            <FontAwesomeIcon icon={faStopwatch as IconProp} />
          </div>
        </div>
        <StepIndicator
          steps={organizationCreationSteps}
          currentStepValue={"2"}
          noLabels={true}
          segmentIndicatorOnBottom={true}
          headingLevel="h2"
        />
        <Alert
          type="warning"
          slim
          className="margin-bottom-neg-2 experian-countdown-alert"
        >
          You have 5 minutes to answer identity verification questions.
        </Alert>
        <form className="usa-form" onSubmit={handleSubmit(onSubmitAnswers)}>
          {fields.map((field, index) => (
            <RadioGroup
              key={field.id}
              legend={field.text}
              selectedRadio={
                formCurrentValues.experianQuestions?.[index]?.value
              }
              buttons={toOptions(field.choices)}
              errorMessage="This field is required"
              validationStatus={
                !!errors.experianQuestions?.[index]?.value ? "error" : undefined
              }
              required
              registrationProps={register(
                `experianQuestions.${index}.value` as const,
                {
                  required: true,
                }
              )}
            />
          ))}
          <Button
            className="width-full margin-top-3"
            type="submit"
            disabled={isSubmitting || saving}
            label={isSubmitting || saving ? "Saving..." : "Submit"}
          />
        </form>
      </Card>
    </CardBackground>
  );
};

export default QuestionsForm;
