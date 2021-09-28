import React, { useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import { useDispatch, connect } from "react-redux";
import { Redirect, Route, Switch } from "react-router-dom";
import { ApplicationInsights } from "@microsoft/applicationinsights-web";

import ProtectedRoute from "./commonComponents/ProtectedRoute";
import Header from "./commonComponents/Header";
import Page from "./commonComponents/Page/Page";
import { setInitialState } from "./store";
import TestResultsList from "./testResults/TestResultsList";
import CleanTestResultsList from "./testResults/CleanTestResultsList";
import TestQueueContainer from "./testQueue/TestQueueContainer";
import ManagePatientsContainer from "./patients/ManagePatientsContainer";
import EditPatientContainer from "./patients/EditPatientContainer";
import AddPatient from "./patients/AddPatient";
import SupportAdminRoutes from "./supportAdmin/SupportAdminRoutes";
import WithFacility from "./facilitySelect/WithFacility";
import { appPermissions, hasPermission } from "./permissions";
import Settings from "./Settings/Settings";
import { getAppInsights } from "./TelemetryService";
import VersionEnforcer from "./VersionEnforcer";
import { TrainingNotification } from "./commonComponents/TrainingNotification";
import { MaintenanceBanner } from "./commonComponents/MaintenanceBanner";
import { Analytics } from "./analytics/Analytics";

export const WHOAMI_QUERY = gql`
  query WhoAmI {
    whoami {
      id
      firstName
      middleName
      lastName
      suffix
      email
      isAdmin
      permissions
      roleDescription
      organization {
        name
        testingFacility {
          id
          name
        }
      }
    }
  }
`;

const App = () => {
  const appInsights = getAppInsights();

  const dispatch = useDispatch();
  const { data, loading, error } = useQuery(WHOAMI_QUERY, {
    fetchPolicy: "no-cache",
  });

  useEffect(() => {
    if (!data) return;

    dispatch(
      setInitialState({
        dataLoaded: true,
        organization: {
          name: data.whoami.organization?.name,
        },
        facilities: data.whoami.organization?.testingFacility || [],
        facility: null,
        user: {
          id: data.whoami.id,
          firstName: data.whoami.firstName,
          middleName: data.whoami.middleName,
          lastName: data.whoami.lastName,
          suffix: data.whoami.suffix,
          email: data.whoami.email,
          roleDescription: data.whoami.roleDescription,
          isAdmin: data.whoami.isAdmin,
          permissions: data.whoami.permissions,
        },
      })
    );
    // eslint-disable-next-line
  }, [data]);

  if (loading) {
    return <p>Loading account information...</p>;
  }

  if (error) {
    if (appInsights instanceof ApplicationInsights) {
      appInsights.trackException({ error });
    }
    return <p>Server connection error...</p>;
  }

  const isSupportAdmin = data.whoami.isAdmin;

  const isOrgAdmin = hasPermission(
    data.whoami.permissions,
    appPermissions.settings.canView
  );

  let homepagePath: string;

  if (isSupportAdmin) {
    homepagePath = "/admin";
  } else if (isOrgAdmin) {
    homepagePath = "/dashboard";
  } else {
    homepagePath = "/queue";
  }

  return (
    <>
      <VersionEnforcer />
      <MaintenanceBanner />
      {process.env.REACT_APP_IS_TRAINING_SITE === "true" && (
        <TrainingNotification />
      )}
      <WithFacility>
        <Page>
          <Header />
          <Switch>
            <Route
              path="/queue"
              render={() => {
                return <TestQueueContainer />;
              }}
            />
            <Route
              path="/"
              exact
              render={({ location }) => (
                <Redirect
                  to={{
                    ...location,
                    pathname: homepagePath,
                  }}
                />
              )}
            />
            <ProtectedRoute
              path="/results/:page"
              render={({ match }: any) => {
                return <TestResultsList pageNumber={match.params.page} />;
              }}
              requiredPermissions={appPermissions.results.canView}
              userPermissions={data.whoami.permissions}
            />
            <ProtectedRoute
              path="/results/"
              render={() => <CleanTestResultsList />}
              requiredPermissions={appPermissions.results.canView}
              userPermissions={data.whoami.permissions}
            />
            <ProtectedRoute
              path={`/patients/:page?`}
              render={({ match }: any) => {
                return <ManagePatientsContainer page={match.params.page} />;
              }}
              requiredPermissions={appPermissions.people.canView}
              userPermissions={data.whoami.permissions}
            />
            <ProtectedRoute
              path={`/patient/:patientId`}
              render={({ match }: any) => (
                <EditPatientContainer patientId={match.params.patientId} />
              )}
              requiredPermissions={appPermissions.people.canEdit}
              userPermissions={data.whoami.permissions}
            />
            <ProtectedRoute
              path={`/add-patient/`}
              render={() => <AddPatient />}
              requiredPermissions={appPermissions.people.canEdit}
              userPermissions={data.whoami.permissions}
            />
            <ProtectedRoute
              path="/settings"
              component={Settings}
              requiredPermissions={appPermissions.settings.canView}
              userPermissions={data.whoami.permissions}
            />
            <ProtectedRoute
              path="/dashboard"
              component={Analytics}
              requiredPermissions={appPermissions.settings.canView}
              userPermissions={data.whoami.permissions}
            />
            <Route
              path={"/admin"}
              render={({ match }) => (
                <SupportAdminRoutes
                  match={match}
                  isAdmin={data.whoami.isAdmin}
                />
              )}
            />
          </Switch>
        </Page>
      </WithFacility>
    </>
  );
};

export default connect()(App);
