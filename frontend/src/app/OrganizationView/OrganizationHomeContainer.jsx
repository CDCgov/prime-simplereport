import React from "react";
import {
  Route,
  Switch,
  Redirect,
  useParams,
  useLocation,
  useRouteMatch,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";

import OrganizationHome from "./OrganizationHome";
import TestResultViewContainer from "../testResults/TestResultViewContainer";
import { loadPatients } from "../patients/state/patientActions";
import TestResultReportQueue from "../testQueue";
import { getPatients } from "../patients/selectors";

const OrganizationHomeContainer = () => {
  const { organizationId } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadPatients(organizationId));
  }, [organizationId, dispatch]);

  const patients = useSelector(getPatients);

  let match = useRouteMatch();
  const location = useLocation();
  return (
    <React.Fragment>
      <Switch>
        <Route
          path={`${match.path}/queue`}
          render={() => {
            return <TestResultReportQueue />;
          }}
        />
        <Route
          path={`${match.path}/results`}
          render={() => {
            return <OrganizationHome patients={patients} />;
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
