import React from "react";

export const areAnswersComplete = (answers) => {
  if (!answers.noSymptoms) {
    const symptoms = JSON.parse(answers.symptoms);
    const filled = Object.values(symptoms).some((v) => v === true);
    if (!filled || !answers.symptomOnset) {
      return false;
    }
  }
  if (!answers.firstTest) {
    if (
      !answers.priorTestDate ||
      !answers.priorTestType ||
      !answers.priorTestResult
    ) {
      return false;
    }
  }
  if (!answers.pregnancy) {
    return false;
  }
  return true;
};

const AskOnEntryTag = ({ aoeAnswers }) => {
  if (areAnswersComplete(aoeAnswers)) {
    return <span className="usa-tag bg-green">COMPLETED</span>;
  } else {
    return <span className="usa-tag">PENDING</span>;
  }
};

export default AskOnEntryTag;
