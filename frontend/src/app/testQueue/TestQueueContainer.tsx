import { useReactiveVar } from "@apollo/client";

import { facilities } from "../../storage/store";

import { useDocumentTitle } from "../utils/hooks";

import TestQueue from "./TestQueue";

const TestQueueContainer = () => {
  useDocumentTitle("Conduct test");
  const { current } = useReactiveVar<FacilitiesState>(facilities);
  const activeFacilityId = current?.id;

  return !activeFacilityId ? (
    <div>No facility selected</div>
  ) : (
    <TestQueue activeFacilityId={activeFacilityId} />
  );
};

export default TestQueueContainer;
