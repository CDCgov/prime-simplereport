import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStopwatch } from "@fortawesome/free-solid-svg-icons";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import RadioGroup from "../../commonComponents/RadioGroup";
import Button from "../../commonComponents/Button/Button";
import { showError } from "../../utils/srToast";
import Alert from "../../commonComponents/Alert";
import { isFormValid, isFieldValid } from "../../utils/yupHelpers";
import StepIndicator from "../../commonComponents/StepIndicator";
import { organizationCreationSteps } from "../../../config/constants";
import { mmss } from "../../testQueue/TestTimer";
import { useDocumentTitle } from "../../utils/hooks";

import { initAnswers, getAnswerKey, toOptions, buildSchema } from "./utils";

import "./QuestionsForm.scss";

interface Props {
  questionSet: Question[];
  saving: boolean;
  onSubmit: (answers: Answers) => void;
  onFail: () => void;
  timeToComplete?: number;
  disableTimer?: boolean;
}

type QuestionFormErrors = Record<keyof Answers, string>;

const QuestionsForm: React.FC<Props> = ({
  questionSet,
  saving,
  onSubmit,
  onFail,
  timeToComplete,
  disableTimer,
}) => {
  useDocumentTitle("Sign up - identity verification | SimpleReport");
  const [answers, setAnswers] = useState<Nullable<Answers>>(
    initAnswers(questionSet)
  );
  const [errors, setErrors] = useState<QuestionFormErrors>({});

  const [formChanged, setFormChanged] = useState(false);

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

  const schema = buildSchema(questionSet);

  const onAnswerChange = <K extends keyof Answers>(field: K) => (
    value: Answers[K]
  ) => {
    setFormChanged(true);
    setAnswers({ ...answers, [field]: value });
  };

  const validateField = async (field: keyof Answers) => {
    setErrors(await isFieldValid({ data: answers, schema, errors, field }));
  };

  const onSave = async () => {
    const validation = await isFormValid({
      data: answers,
      schema,
    });
    if (validation.valid) {
      setErrors({});
      onSubmit(answers as Answers);
      return;
    }
    setErrors(validation.errors);
    showError(
      "Please check the form to make sure you complete all of the required fields.",
      "Form Errors"
    );
  };

  return (
    <CardBackground>
      <Card logo>
        <div
          className="grid-row prime-test-name usa-card__header"
          id="experian-questions-header"
        >
          <h4 className="margin-left-0">Sign up for SimpleReport</h4>
          <button className="timer-button timer-running" data-testid="timer">
            <span>{mmss(timeLeft)}</span> <FontAwesomeIcon icon={faStopwatch} />
          </button>
        </div>
        <StepIndicator
          steps={organizationCreationSteps}
          currentStepValue={"2"}
          noLabels={true}
          segmentIndicatorOnBottom={true}
        />
        <Alert
          type="warning"
          slim
          className="margin-bottom-neg-2 experian-countdown-alert"
        >
          You have 5 minutes to answer identity verification questions.
        </Alert>
        <div className="usa-form">
          {questionSet.map((question, index) => {
            const key = getAnswerKey(index);
            return (
              <div key={index}>
                <RadioGroup
                  legend={question.questionText}
                  selectedRadio={answers[key]}
                  buttons={toOptions(question.questionSelect.questionChoice)}
                  onChange={onAnswerChange(key)}
                  onBlur={() => validateField(key)}
                  errorMessage={errors[key]}
                  validationStatus={errors[key] ? "error" : undefined}
                  required
                />
              </div>
            );
          })}
        </div>
        <Button
          className="width-full margin-top-3"
          disabled={saving || !formChanged}
          onClick={onSave}
          label={saving ? "Saving..." : "Submit"}
        />
      </Card>
    </CardBackground>
  );
};

export default QuestionsForm;
