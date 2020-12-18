import React from "react";
import { Route } from "react-router-dom";

const HealthChecks: React.FC<{}> = ({ match }: any) => (
  <>
    <Route path={match.url + "/ping"} render={() => <div>pong</div>} />
    <Route
      path={match.url + "/commit"}
      render={() => <div>{process.env.REACT_APP_CURRENT_COMMIT}</div>}
    />
  </>
);

export default HealthChecks;
