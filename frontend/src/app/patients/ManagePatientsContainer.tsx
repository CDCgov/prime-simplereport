import React from "react";
import { useSelector } from "react-redux";

import { hasPermission, appPermissions } from "../permissions";
import { RootState } from "../store";
import { useDocumentTitle } from "../utils/hooks";

import ManagePatients from "./ManagePatients";

const ManagePatientsContainer = (props: { page?: number }) => {
  useDocumentTitle("People");
  const activeFacilityId = useSelector(
    (state) => (state as any).facility.id as string
  );
  const user = useSelector<RootState, User>((state) => state.user);
  const isAdmin = useSelector<RootState, boolean>(
    (state) => state.user.isAdmin
  );

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
      isAdmin={isAdmin}
    />
  );
};

export default ManagePatientsContainer;
