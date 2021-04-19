import React, { useState, useEffect } from "react";

export const areAnswersComplete = (answers) => {
  if (!answers.noSymptoms) {
    const symptoms = JSON.parse(answers.symptoms);
    //TODO: real booleans rather than Pinocchio boolean strings
    const filled = Object.values(symptoms).some((v) => String(v) === "true");
    if (!filled || !answers.symptomOnset) {
      return false;
    }
  }
  if (!answers.firstTest && !answers.priorTestType) {
    return false;
  }
  if (!answers.pregnancy) {
    return false;
  }
  return true;
};

const AskOnEntryTag = ({ aoeAnswers }) => {
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
