import React from "react";
import {
  Route,
  Switch,
  Redirect,
  useLocation,
  useRouteMatch,
} from "react-router-dom";
import { useSelector } from "react-redux";

import OrganizationHome from "./OrganizationHome";
import TestQueue from "../testQueue/TestQueue";
import { getPatients } from "../patients/patientSelectors";
import ManagePatients from "../patients/ManagePatients";

const OrganizationHomeContainer = () => {
  const patients = useSelector(getPatients);

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
            return <OrganizationHome patients={patients} />;
          }}
        />
        <Route
          path={`${match.path}/patients`}
          render={() => {
            return <ManagePatients />;
          }}
        />
        <Route path={`${match.path}/`}>
          {/* default to the queue */}
          <Redirect to={`${location.pathname}/queue`} />
        </Route>
      </Switch>
    </React.Fragment>
  );
};

export default OrganizationHomeContainer;
