import React from "react";
import {
  Route,
  Switch,
  Redirect,
  useLocation,
  useRouteMatch,
} from "react-router-dom";
import { AppInsightsErrorBoundary } from "@microsoft/applicationinsights-react-js";
import { reactPlugin } from "../AppInsights";

import TestResultsList from "../testResults/TestResultsList";
import TestQueue from "../testQueue/TestQueue";
import ManagePatients from "../patients/ManagePatients";
import EditPatient from "../patients/EditPatient";
import AddPatient from "../patients/AddPatient";
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
            return (
              <AppInsightsErrorBoundary
                onError={() => <p> There was an error with the queue </p>}
                appInsights={reactPlugin}
              >
                <TestQueue />
              </AppInsightsErrorBoundary>
            );
          }}
        />
        <Route
          path={`${match.path}/results`}
          render={() => {
            return (
              <AppInsightsErrorBoundary
                onError={() => <p> There was an error with test results </p>}
                appInsights={reactPlugin}
              >
                <TestResultsList />
              </AppInsightsErrorBoundary>
            );
          }}
        />
        <Route
          path={`${match.path}/patients`}
          render={() => {
            return <ManagePatients />;
          }}
        />
        <Route
          path={`${match.path}/patient/:patientId`}
          render={({ match }) => (
            <EditPatient patientId={match.params.patientId} />
          )}
        />
        <Route
          path={`${match.path}/add-patient/`}
          render={() => <AddPatient />}
        />
        <Route
          path={`${match.path}/settings`}
          render={() => {
            return <Settings />;
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
