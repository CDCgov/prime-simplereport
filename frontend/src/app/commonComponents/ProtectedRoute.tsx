import React from "react";
import { Redirect, Route } from "react-router-dom";

import { UserPermission } from "../../generated/graphql";

interface Props {
  requiredPermissions: UserPermission[];
  userPermissions: UserPermission[] | undefined;
  path: string;
  component?: React.FC<any>;
  render?: any;
}
const ProtectedRoute: React.FC<Props> = ({
  requiredPermissions,
  userPermissions,
  ...rest
}) => {
  let hasAccess;
  if (!userPermissions) {
    hasAccess = false;
  } else {
    hasAccess = requiredPermissions.every((requiredPermission) =>
      userPermissions.includes(requiredPermission)
    );
  }

  return hasAccess ? <Route {...rest} /> : <Redirect to={`/`} />;
};

export default ProtectedRoute;
