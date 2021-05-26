import React from "react";
import { useSelector } from "react-redux";

import { useDocumentTitle } from "../utils/hooks";

import TestQueue from "./TestQueue";

const TestQueueContainer = () => {
  useDocumentTitle("Conduct test");
  const activeFacilityId = useSelector(
    (state) => (state as any).facility.id as string
  );
  return !activeFacilityId.length ? (
    <div>"No facility selected"</div>
  ) : (
    <TestQueue activeFacilityId={activeFacilityId} />
  );
};

export default TestQueueContainer;
