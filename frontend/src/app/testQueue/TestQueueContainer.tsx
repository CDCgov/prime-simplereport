import { useSelectedFacility } from "../facilitySelect/useSelectedFacility";
import { useDocumentTitle } from "../utils/hooks";

import TestQueue from "./TestQueue";

const TestQueueContainer = () => {
  useDocumentTitle("Report test");
  const [facility] = useSelectedFacility();
  const activeFacilityId = facility?.id;

  return !activeFacilityId ? (
    <div>"No facility selected"</div>
  ) : (
    <TestQueue activeFacilityId={activeFacilityId} />
  );
};

export default TestQueueContainer;
