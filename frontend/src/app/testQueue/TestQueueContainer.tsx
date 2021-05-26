import React from "react";
import { useSelector } from "react-redux";

import WithPageTitle from "../commonComponents/PageTitle";

import TestQueue from "./TestQueue";

const TestQueueContainer = () => {
  const activeFacilityId = useSelector(
    (state) => (state as any).facility.id as string
  );

  return (
<>      <WithPageTitle title="Conduct test"/>
    {!activeFacilityId.length ? <div>"No facility selected"</div> : <TestQueue activeFacilityId={activeFacilityId} />}
    </>);
};

export default TestQueueContainer;
