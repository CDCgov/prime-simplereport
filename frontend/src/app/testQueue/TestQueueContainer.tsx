import React, { useContext } from "react";
// import { useSelector } from "react-redux";
import { WhoAmIContext } from "../WhoAmIContext";

import TestQueue from "./TestQueue";

const TestQueueContainer = () => {
  let { activeFacility } = useContext(WhoAmIContext);
  // const activeFacilityId = useSelector(
  // (state) => (state as any).facility.id as string
  // );
  if (activeFacility) {
    return <div>"No facility selected"</div>;
  }
  return <TestQueue activeFacilityId={activeFacility.id} />;
};

export default TestQueueContainer;
