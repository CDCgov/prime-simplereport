import React from "react";
import { useSelector } from "react-redux";

import TestResultsList from "./TestResultsList";

const TestResultsContainer = () => {
  const activeFacilityId = useSelector(
    (state) => (state as any).facility.id as string
  );
  if (activeFacilityId.length < 1) {
    return <div>"No facility selected"</div>;
  }
  return <TestResultsList activeFacilityId={activeFacilityId} />;
};

export default TestResultsContainer;
