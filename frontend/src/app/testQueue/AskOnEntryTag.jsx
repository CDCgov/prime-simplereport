import React from "react";

export const areAnswersComplete = (answerDict) => {
  if (!answerDict.noSymptoms) {
    let symptomFound = false;

    try {
      const symptoms = JSON.parse(answerDict.symptoms);
      Object.values(symptoms).forEach((val) => {
        if (val) {
          symptomFound = true;
        }
      });
    } catch (e) {
      console.error("expected json response. found:", e);
    }

    if (!symptomFound) {
      return false;
    }
    if (answerDict.symptomOnset) {
      const onsetDate = answerDict.symptomOnset;
      if (!onsetDate) {
        return false;
      }
    }
  }
  if (!answerDict.firstTest) {
    if (!answerDict.priorTestDate) {
      return false;
    }
    if (!answerDict.priorTestType || !answerDict.priorTestResult) {
      return false;
    }
  }
  if (!answerDict.pregnancy) {
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
