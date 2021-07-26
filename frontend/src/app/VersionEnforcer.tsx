import { useEffect } from "react";
import { RouteComponentProps, withRouter } from "react-router";

import { VersionService } from "./VersionService";

const VersionEnforcer: React.FunctionComponent<RouteComponentProps> = (
  props: RouteComponentProps
) => {
  useEffect(() => {
    VersionService.enforce();
  }, [props.location]);
  return null;
};

export default withRouter(VersionEnforcer);
