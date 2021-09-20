import { useState, useEffect } from "react";

import { AoEAnswers } from "./AoEForm/AoEForm";

export const areAnswersComplete = (answers: AoEAnswers) => {
  if (!answers.noSymptoms) {
    const symptoms = JSON.parse(answers.symptoms);
    const filled = Object.values(symptoms).some((v) => String(v) === "true");
    if (!filled || !answers.symptomOnset) {
      return false;
    }
  }
  if (!answers.pregnancy) {
    return false;
  }
  return true;
};

interface Props {
  aoeAnswers: AoEAnswers;
}

const AskOnEntryTag: React.FC<Props> = ({ aoeAnswers }) => {
  const [answers, setAnswers] = useState(aoeAnswers);
  useEffect(() => {
    setAnswers(aoeAnswers);
  }, [aoeAnswers]);
  if (areAnswersComplete(answers)) {
    return <span className="usa-tag bg-green">COMPLETED</span>;
  } else {
    return <span className="usa-tag">PENDING</span>;
  }
};

export default AskOnEntryTag;
