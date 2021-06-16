import { useEffect } from "react";
import { RouteComponentProps, withRouter } from "react-router";

import { VersionService } from "./VersionService";

const VersionEnforcer: React.FunctionComponent<RouteComponentProps> = (
  props: RouteComponentProps
) => {
  useEffect(() => {
    (async () => {
      const sha = await VersionService.getSHA();
      console.info(
        "current commit from env: ",
        process.env.REACT_APP_CURRENT_COMMIT
      );
      console.info("sha from fetch: ", sha);
      if (process.env.REACT_APP_CURRENT_COMMIT !== sha) {
        VersionService.reload();
      }
    })();
  }, [props.location]);

  return null;
};

export default withRouter(VersionEnforcer);
