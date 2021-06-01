import { useReactiveVar } from "@apollo/client";

import { currentFacility } from "../../config/cache";

import { useDocumentTitle } from "../utils/hooks";

import TestQueue from "./TestQueue";

const TestQueueContainer = () => {
  useDocumentTitle("Conduct test");
  const facility = useReactiveVar<Facility | null>(currentFacility);
  const activeFacilityId = facility?.id;

  return !activeFacilityId ? (
    <div>"No facility selected"</div>
  ) : (
    <TestQueue activeFacilityId={activeFacilityId} />
  );
};

export default TestQueueContainer;
