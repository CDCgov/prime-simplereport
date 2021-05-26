import React from "react";
import { useSelector } from "react-redux";

import WithPageTitle from "../commonComponents/WithPageTitle";
import { hasPermission, appPermissions } from "../permissions";
import { RootState } from "../store";

import ManagePatients from "./ManagePatients";

const ManagePatientsContainer = (props: { page?: number }) => {
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
    <>
      <WithPageTitle title="People" />
      <ManagePatients
        activeFacilityId={activeFacilityId}
        canEditUser={canEditUser}
        canDeleteUser={canDeleteUser}
        currentPage={props.page}
        isAdmin={isAdmin}
      />
    </>
  );
};

export default ManagePatientsContainer;
