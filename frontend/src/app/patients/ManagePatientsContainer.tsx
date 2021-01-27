import React from "react";
import { useSelector } from "react-redux";

import ManagePatients from "./ManagePatients";
import { hasPermission, appPermissions } from "../permissions";

const TestResultsContainer = () => {
  const activeFacilityId = useSelector(
    (state) => (state as any).facility.id as string
  );
  const user = useSelector((state) => (state as any).user as User);

  const canEditUser = hasPermission(
    user.permissions,
    appPermissions.people.canEdit
  );
  if (activeFacilityId.length < 1) {
    return <div>"No facility selected"</div>;
  }
  return (
    <ManagePatients
      activeFacilityId={activeFacilityId}
      canEditUser={canEditUser}
    />
  );
};

export default TestResultsContainer;
