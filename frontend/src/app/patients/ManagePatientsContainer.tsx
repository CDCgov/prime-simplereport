import React from "react";
import { useSelector } from "react-redux";

import ManagePatients from "./ManagePatients";

const TestResultsContainer = () => {
  const activeFacilityId = useSelector(
    (state) => (state as any).facility.id as string
  );
  if (activeFacilityId.length < 1) {
    return <div>"No facility selected"</div>;
  }
  return <ManagePatients activeFacilityId={activeFacilityId} />;
};

export default TestResultsContainer;
