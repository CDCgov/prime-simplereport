import React from "react";
import { Navigate } from "react-router-dom";

import { UserPermission } from "../../generated/graphql";

interface Props {
  requiredPermissions: UserPermission[];
  userPermissions: UserPermission[] | undefined;
  element: any;
}
const ProtectedRoute: React.FC<Props> = ({
  requiredPermissions,
  userPermissions,
  element,
}) => {
  let hasAccess;
  if (!userPermissions) {
    hasAccess = false;
  } else {
    hasAccess = requiredPermissions.every((requiredPermission) =>
      userPermissions.includes(requiredPermission)
    );
  }

  return hasAccess ? element : <Navigate to="/" />;
};

export default ProtectedRoute;
