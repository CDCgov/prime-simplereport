import { useEffect } from "react";
import { RouteComponentProps, withRouter } from "react-router";

import { VersionService } from "./VersionService";

const VersionEnforcer: React.FunctionComponent<RouteComponentProps> = (
  props: RouteComponentProps
) => {
  useEffect(() => {
    (async () => {
      if (
        process.env.REACT_APP_CURRENT_COMMIT !== (await VersionService.getSHA())
      ) {
        VersionService.reload();
      }
    })();
  }, [props.location]);

  return null;
};

export default withRouter(VersionEnforcer);
