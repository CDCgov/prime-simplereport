import React from "react";
import { useSelector } from "react-redux";

import TestQueue from "./TestQueue";

const TestQueueContainer = () => {
  const activeFacilityId = useSelector(
    (state) => (state as any).facility.id as string
  );
  if (activeFacilityId.length < 1) {
    return <div>"No facility selected"</div>;
  }
  return <TestQueue activeFacilityId={activeFacilityId} />;
};

export default TestQueueContainer;
