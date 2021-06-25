import { useState } from "react";
import * as yup from "yup";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import RadioGroup from "../../commonComponents/RadioGroup";
import Button from "../../commonComponents/Button/Button";

import { initAnswers, getAnswerKey, toOptions } from "./utils";

interface Props {
  questionSet: Question[];
  saving: boolean;
  onSubmit: (answers: Answers) => void;
}

const QuestionsForm: React.FC<Props> = ({ questionSet, saving, onSubmit }) => {
  const [answers, setAnswers] = useState<Nullable<Answers>>(
    initAnswers(questionSet)
  );
  const [formChanged, setFormChanged] = useState(false);

  const schema = yup.object({
    firstName: yup.string().required(),
    middleName: yup.string().nullable(),
    lastName: yup.string().required(),
    suffix: yup.string().nullable(),
    email: yup.string().email().required(),
  });

  const onAnswerChange = <K extends keyof Answers>(field: K) => (
    value: Answers[K]
  ) => {
    setFormChanged(true);
    setAnswers({ ...answers, [field]: value });
  };

  return (
    <CardBackground>
      <Card>
        <div className="usa-form">
          {questionSet.map((question, index) => (
            <div key={index}>
              <RadioGroup
                legend={question.questionText}
                selectedRadio={answers[getAnswerKey(index)]}
                buttons={toOptions(question.questionSelect.questionChoice)}
                onChange={onAnswerChange(getAnswerKey(index))}
                required
              />
            </div>
          ))}
        </div>
        <Button
          disabled={saving || !formChanged}
          onClick={() => onSubmit(answers as any)} // TODO: fix this
          label={saving ? "Saving..." : "Submit"}
        />
      </Card>
    </CardBackground>
  );
};

export default QuestionsForm;
