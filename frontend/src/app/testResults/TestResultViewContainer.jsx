import React from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";

import TestResultView from "./TestResultView";
import { loadTestResult } from "./state/testResultActions";

const TestResultViewContainer = () => {
  const { patientId } = useParams();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(loadTestResult(patientId));
  }, [patientId, dispatch]);

  const patient = useSelector((state) => state.patients[patientId]);
  const testResult = useSelector((state) => {
    console.log(state);
    return state.testResults[patient.testResultId];
  });
  console.log("TRVC testResult", testResult);
  return <TestResultView testResult={testResult} patient={patient} />;
};

export default TestResultViewContainer;
