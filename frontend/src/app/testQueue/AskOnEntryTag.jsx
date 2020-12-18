import React from "react";

export const areAnswersComplete = (answers) => {
  if (!answers.noSymptoms) {
    const symptoms = JSON.parse(answers.symptoms);
    //TODO: real booleans rather than Pinocchio boolean strings
    const filled = Object.values(symptoms).some((v) => String(v) === "true");
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
