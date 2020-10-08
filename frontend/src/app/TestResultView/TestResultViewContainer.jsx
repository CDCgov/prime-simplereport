import React from "react";
import { useParams } from "react-router-dom";
import TestResultView from "./TestResultView";
import { useSelector, useDispatch } from "react-redux";
import { loadTestResult } from "../testResults/state/testResultActions";
import { useEffect } from "react";

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
