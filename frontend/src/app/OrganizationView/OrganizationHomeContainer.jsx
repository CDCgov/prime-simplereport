import React from "react";
import {
  Route,
  Switch,
  Redirect,
  useLocation,
  useRouteMatch,
} from "react-router-dom";

import TestResultsList from "../testResults/TestResultsList";
import TestQueue from "../testQueue/TestQueue";
import ManagePatients from "../patients/ManagePatients";
import Settings from "../Settings/Settings";

const OrganizationHomeContainer = () => {
  let match = useRouteMatch();
  const location = useLocation();

  return (
    <React.Fragment>
      <Switch>
        <Route
          path={`${match.path}/queue`}
          render={() => {
            return <TestQueue />;
          }}
        />
        <Route
          path={`${match.path}/results`}
          render={() => {
            return <TestResultsList />;
          }}
        />
        <Route
          path={`${match.path}/patients`}
          render={() => {
            return <ManagePatients />;
          }}
        />
        <Route
          path={`${match.path}/settings`}
          render={() => {
            return <Settings />;
          }}
        />
        <Route path={`${match.path}/`}>
          {/* default to the queue */}
          <Redirect to={`${location.pathname}/patients`} />
        </Route>
      </Switch>
    </React.Fragment>
  );
};

export default OrganizationHomeContainer;
