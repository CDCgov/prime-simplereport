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
import Page from "./commonComponents/Page/Page";
import { setInitialState } from "./store";
import { appPermissions } from "./permissions";
import { getAppInsights } from "./TelemetryService";
import VersionEnforcer from "./VersionEnforcer";
import { TrainingNotification } from "./commonComponents/TrainingNotification";
import LabReportForm from "./universalReporting/LabReportForm";
import PilotHeader from "./commonComponents/PilotHeader";
import ReportLandingPage from "./universalReporting/ReportLandingPage";

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

const checkOktaLoginStatus = (
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

const PilotApp = () => {
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

  const homepagePath: string = "report";

  const canViewResults = appPermissions.results.canView;

  if (!universalReportingEnabled) {
    return <Navigate to={{ pathname: "/", search: location.search }} />;
  }

  return (
    <>
      <VersionEnforcer />
      {process.env.REACT_APP_IS_TRAINING_SITE === "true" && (
        <TrainingNotification />
      )}
      <Page
        isPilotApp={true}
        header={<PilotHeader />}
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
            <Route path="report" element={<ReportLandingPage />} />
            <Route
              path="report/lab"
              element={
                <ProtectedRoute
                  requiredPermissions={canViewResults}
                  userPermissions={data.whoami.permissions}
                  element={<LabReportForm />}
                />
              }
            />
            <Route path="settings/*" element={<Navigate to={"/pilot"} />} />
          </Routes>
        }
      />
    </>
  );
};

export default connect()(PilotApp);
