import { useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import { useDispatch, connect } from "react-redux";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  Location,
} from "react-router-dom";
import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import jwtDecode from "jwt-decode";
import { useFeature } from "flagged";

import ProtectedRoute from "./commonComponents/ProtectedRoute";
import Header from "./commonComponents/Header";
import Page from "./commonComponents/Page/Page";
import { setInitialState } from "./store";
import TestResultsList from "./testResults/viewResults/TestResultsList";
import CleanTestResultsList from "./testResults/viewResults/CleanTestResultsList";
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
import { Analytics } from "./analytics/Analytics";
import Schema from "./testResults/uploads/CsvSchemaDocumentation";
import Submission from "./testResults/submissions/Submission";
import Submissions from "./testResults/submissions/Submissions";
import ResultsNavWrapper from "./testResults/ResultsNavWrapper";
import DeviceLookupContainer from "./uploads/DeviceLookup/DeviceLookupContainer";
import UploadPatients from "./patients/UploadPatients";
import DiseaseSpecificUploadContainer from "./testResults/uploads/DiseaseSpecificUploadContainer";
import { specificSchemaBuilder } from "./testResults/uploads/specificSchemaBuilder";
import LabReportForm from "./universalReporting/LabReportForm";

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

export const checkOktaLoginStatus = (
  accessToken: string | null,
  location: Location
) => {
  if (process.env.REACT_APP_OKTA_ENABLED === "true") {
    if (!accessToken) {
      // If Okta login has been attempted and returned to SR with an error, don't redirect back to Okta
      const params = new URLSearchParams(location.hash.slice(1));
      if (params.get("error")) {
        throw new Error(
          params.get("error_description") ?? "Unknown Okta error"
        );
      }
      throw new Error("Not authenticated, redirecting to Okta...");
    }
  }
};

const ReportingApp = () => {
  const universalReportingEnabled = useFeature("universalReportingEnabled");
  const appInsights = getAppInsights();
  const dispatch = useDispatch();
  const location = useLocation();
  const accessToken = localStorage.getItem("access_token");

  // Check if the user is logged in, if not redirect to Okta
  checkOktaLoginStatus(accessToken, location);

  const { data, loading, error } = useQuery(WHOAMI_QUERY, {
    fetchPolicy: "no-cache",
  });

  useEffect(() => {
    if (!data) return;

    appInsights?.setAuthenticatedUserContext(data.whoami.id, undefined, false);
    if (window?.visualViewport?.width) {
      appInsights?.trackMetric(
        {
          name: "userViewport_reporting",
          average: window.visualViewport.width,
        },
        {
          width: window.visualViewport.width,
          height: window.visualViewport.height,
        }
      );
    }

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
  }, [data, dispatch, appInsights]);

  if (loading) {
    return <p>Loading account information...</p>;
  }

  if (error) {
    if (appInsights instanceof ApplicationInsights) {
      let decoded: any;
      let validToken = null;
      if (accessToken) {
        try {
          decoded = jwtDecode(accessToken);
          validToken = true;
        } catch (e) {
          validToken = false;
          console.error("Failed to decode access token", e);
        }
      }
      const rolesFieldName = `${process.env.REACT_APP_OKTA_TOKEN_ROLE_CLAIM}`;
      appInsights.trackException({
        exception: error,
        properties: {
          "user message": "Server connection error",
          "valid access token": validToken,
          "token subject": decoded?.sub,
          "token roles": decoded?.[rolesFieldName],
        },
      });
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
      {process.env.REACT_APP_IS_TRAINING_SITE === "true" && (
        <TrainingNotification />
      )}
      <WithFacility>
        <Page
          header={<Header />}
          children={
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
                    element={
                      <ResultsNavWrapper>
                        <TestResultsList />
                      </ResultsNavWrapper>
                    }
                  />
                }
              />
              <Route
                path="results"
                element={
                  <ProtectedRoute
                    requiredPermissions={canViewResults}
                    userPermissions={data.whoami.permissions}
                    element={
                      <ResultsNavWrapper>
                        <CleanTestResultsList />
                      </ResultsNavWrapper>
                    }
                  />
                }
              />
              <Route
                path="results/upload/submit"
                element={
                  <ProtectedRoute
                    requiredPermissions={canViewResults}
                    userPermissions={data.whoami.permissions}
                    element={
                      <ResultsNavWrapper>
                        <DiseaseSpecificUploadContainer />
                      </ResultsNavWrapper>
                    }
                  />
                }
              />
              {universalReportingEnabled && (
                <Route
                  path="results/universal"
                  element={
                    <ProtectedRoute
                      requiredPermissions={canViewResults}
                      userPermissions={data.whoami.permissions}
                      element={<LabReportForm />}
                    />
                  }
                />
              )}
              <Route
                path="results/upload/submit/guide"
                element={
                  <ProtectedRoute
                    requiredPermissions={canViewResults}
                    userPermissions={data.whoami.permissions}
                    element={
                      <ResultsNavWrapper>
                        <Schema
                          schemaBuilder={specificSchemaBuilder}
                          returnUrl={"/results/upload/submit"}
                        />
                      </ResultsNavWrapper>
                    }
                  />
                }
              />
              <Route
                path="results/upload/submit/code-lookup"
                element={
                  <ProtectedRoute
                    requiredPermissions={canViewResults}
                    userPermissions={data.whoami.permissions}
                    element={
                      <ResultsNavWrapper>
                        <DeviceLookupContainer />
                      </ResultsNavWrapper>
                    }
                  />
                }
              />
              <Route
                path="results/upload/submissions/submission/:id"
                element={
                  <ProtectedRoute
                    requiredPermissions={canViewResults}
                    userPermissions={data.whoami.permissions}
                    element={
                      <ResultsNavWrapper>
                        <Submission />
                      </ResultsNavWrapper>
                    }
                  />
                }
              />
              <Route
                path={"results/upload/submissions"}
                element={
                  <ProtectedRoute
                    requiredPermissions={canViewResults}
                    userPermissions={data.whoami.permissions}
                    element={
                      <ResultsNavWrapper>
                        <Submissions />
                      </ResultsNavWrapper>
                    }
                  />
                }
              />
              <Route
                path={"results/upload/submissions/:pageNumber"}
                element={
                  <ProtectedRoute
                    requiredPermissions={canViewResults}
                    userPermissions={data.whoami.permissions}
                    element={
                      <ResultsNavWrapper>
                        <Submissions />
                      </ResultsNavWrapper>
                    }
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
                path="upload-patients"
                element={
                  <ProtectedRoute
                    requiredPermissions={canEditPeople}
                    userPermissions={data.whoami.permissions}
                    element={<UploadPatients />}
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
          }
        />
      </WithFacility>
    </>
  );
};

export default connect()(ReportingApp);
