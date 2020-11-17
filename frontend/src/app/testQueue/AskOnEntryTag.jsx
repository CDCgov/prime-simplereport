
import React from "react";

export const areAnswersComplete = (answerDict) => {
  if (answerDict.symptoms) {
    let symptomFound = false;
    Object.values(answerDict.symptoms).forEach((val) => {
      if (val) {
        symptomFound = true;
      }
    });
    if (!symptomFound) {
      return false;
    }
    if (answerDict.symptomOnset) {
      const onsetDate = answerDict.symptomOnset;
      if (
        onsetDate.year === "" ||
        onsetDate.month === "" ||
        onsetDate.day === ""
      ) {
        return false;
      }
    }
  }
  const priorTest = answerDict.priorTest;
  if (!priorTest) {
    return false;
  } else if (!priorTest.exists) {
    // this field name is incorrect!
    if (
      priorTest.date.year === "" ||
      priorTest.date.month === "" ||
      priorTest.date.day === ""
    ) {
      return false;
    }
    if (!priorTest.type || !priorTest.result) {
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
