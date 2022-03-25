import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { useSelectedFacility } from "../facilitySelect/useSelectedFacility";
import { hasPermission, appPermissions } from "../permissions";
import { RootState } from "../store";
import { useDocumentTitle } from "../utils/hooks";

import ManagePatients from "./ManagePatients";

const ManagePatientsContainer = () => {
  useDocumentTitle("People");
  const { pageNumber } = useParams();
  const currentPage = pageNumber ? +pageNumber : 1;
  const [facility] = useSelectedFacility();
  const activeFacilityId = facility?.id || "";
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
      currentPage={currentPage}
      isAdmin={isAdmin}
    />
  );
};

export default ManagePatientsContainer;
