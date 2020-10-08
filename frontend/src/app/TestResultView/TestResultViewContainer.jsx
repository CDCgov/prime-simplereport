import React from "react";
import { useParams } from "react-router-dom";
import TestResultView from "./TestResultView";
import { useSelector, useDispatch } from "react-redux";
import { loadTestResult } from "../actions/testResult";
import { useEffect } from "react";
import { state } from "../../utils/mappers";

const TestResultViewContainer = ({}) => {
  console.log("process.env", process.env);
  const { patientId } = useParams();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(loadTestResult(patientId));
  }, []);
  // const patient = useSelector(
  //   (state) => state.patient[patientId]
  // );
  // const testResult = useSelector(
  //   (state) => state.testResults[patient.testResu]
  // );
  return <TestResultView testResult />;
};

export default TestResultViewContainer;
