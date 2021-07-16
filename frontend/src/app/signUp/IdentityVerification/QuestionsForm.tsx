import { useState } from "react";
import { toast } from "react-toastify";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import RadioGroup from "../../commonComponents/RadioGroup";
import Button from "../../commonComponents/Button/Button";
import { showNotification } from "../../utils";
import Alert from "../../commonComponents/Alert";
import { isFormValid, isFieldValid } from "../../utils/yupHelpers";

import { initAnswers, getAnswerKey, toOptions, buildSchema } from "./utils";

interface Props {
  questionSet: Question[];
  saving: boolean;
  onSubmit: (answers: Answers) => void;
}

type QuestionFormErrors = Record<keyof Answers, string>;

const QuestionsForm: React.FC<Props> = ({ questionSet, saving, onSubmit }) => {
  const [answers, setAnswers] = useState<Nullable<Answers>>(
    initAnswers(questionSet)
  );
  const [errors, setErrors] = useState<QuestionFormErrors>({});

  const [formChanged, setFormChanged] = useState(false);
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
    const alert = (
      <Alert
        type="error"
        title="Form Errors"
        body="Please check the form to make sure you complete all of the required fields."
      />
    );
    showNotification(toast, alert);
  };

  return (
    <CardBackground>
      <Card logo>
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
          disabled={saving || !formChanged}
          onClick={onSave}
          label={saving ? "Saving..." : "Submit"}
        />
      </Card>
    </CardBackground>
  );
};

export default QuestionsForm;
