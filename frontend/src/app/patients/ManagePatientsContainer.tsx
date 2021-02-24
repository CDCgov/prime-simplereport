import React from "react";
import { useSelector } from "react-redux";

import ManagePatients from "./ManagePatients";
import { hasPermission, appPermissions } from "../permissions";

const ManagePatientsContainer = (props: { page?: number }) => {
  const activeFacilityId = useSelector(
    (state) => (state as any).facility.id as string
  );
  const user = useSelector((state) => (state as any).user as User);

  const canEditUser = hasPermission(
    user.permissions,
    appPermissions.people.canEdit
  );
  const canDeleteUser = hasPermission(
    user.permissions,
    appPermissions.people.canDelete
  );
  if (activeFacilityId.length < 1) {
    return <div>"No facility selected"</div>;
  }
  return (
    <ManagePatients
      activeFacilityId={activeFacilityId}
      canEditUser={canEditUser}
      canDeleteUser={canDeleteUser}
      currentPage={props.page}
    />
  );
};

export default ManagePatientsContainer;
