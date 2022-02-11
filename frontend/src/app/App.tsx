import { useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import { useDispatch, connect } from "react-redux";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
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
  const location = useLocation();

  // Check if the user is logged in, if not redirect to Okta
  if (process.env.REACT_APP_OKTA_ENABLED === "true") {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      // If Okta login has been attempted and returned to SR with an error, don't redirect back to Okta
      const params = new URLSearchParams(location.hash.slice(1));
      if (params.get("error")) {
        throw new Error(
          params.get("error_description") || "Unknown Okta error"
        );
      }
      throw new Error("Not authenticated, redirecting to Okta...");
    }
  }

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
    homepagePath = "admin";
  } else if (isOrgAdmin) {
    homepagePath = "dashboard";
  } else {
    homepagePath = "queue";
  }

  const canViewResults = appPermissions.results.canView;
  const canViewPeople = appPermissions.people.canView;
  const canEditPeople = appPermissions.people.canEdit;
  const canViewSettings = appPermissions.settings.canView;

  return (
    <>
      <VersionEnforcer />
      {process.env.REACT_APP_DISABLE_MAINTENANCE_BANNER === "true" ? null : (
        <MaintenanceBanner />
      )}
      {process.env.REACT_APP_IS_TRAINING_SITE === "true" && (
        <TrainingNotification />
      )}
      <WithFacility>
        <Page>
          <Header />
          <Routes>
            <Route
              path="/"
              element={
                <Navigate
                  to={{ pathname: homepagePath, search: location.search }}
                />
              }
            />
            <Route path="queue" element={<TestQueueContainer />} />
            <Route
              path="results/:pageNumber"
              element={
                <ProtectedRoute
                  requiredPermissions={canViewResults}
                  userPermissions={data.whoami.permissions}
                  element={<TestResultsList />}
                />
              }
            />
            <Route
              path="results"
              element={
                <ProtectedRoute
                  requiredPermissions={canViewResults}
                  userPermissions={data.whoami.permissions}
                  element={<CleanTestResultsList />}
                />
              }
            />
            <Route path="patients">
              <Route
                path=":pageNumber"
                element={
                  <ProtectedRoute
                    requiredPermissions={canViewPeople}
                    userPermissions={data.whoami.permissions}
                    element={<ManagePatientsContainer />}
                  />
                }
              />
              <Route
                path=""
                element={
                  <ProtectedRoute
                    requiredPermissions={canViewPeople}
                    userPermissions={data.whoami.permissions}
                    element={<ManagePatientsContainer />}
                  />
                }
              />
            </Route>
            <Route
              path="patient/:patientId"
              element={
                <ProtectedRoute
                  requiredPermissions={canEditPeople}
                  userPermissions={data.whoami.permissions}
                  element={<EditPatientContainer />}
                />
              }
            />
            <Route
              path="add-patient"
              element={
                <ProtectedRoute
                  requiredPermissions={canEditPeople}
                  userPermissions={data.whoami.permissions}
                  element={<AddPatient />}
                />
              }
            />
            <Route
              path="settings/*"
              element={
                <ProtectedRoute
                  requiredPermissions={canViewSettings}
                  userPermissions={data.whoami.permissions}
                  element={<Settings />}
                />
              }
            />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute
                  requiredPermissions={canViewSettings}
                  userPermissions={data.whoami.permissions}
                  element={<Analytics />}
                />
              }
            />
            <Route
              path="admin/*"
              element={<SupportAdminRoutes isAdmin={isSupportAdmin} />}
            />
          </Routes>
        </Page>
      </WithFacility>
    </>
  );
};

export default connect()(App);
