import React, { useEffect } from "react";
import { connect, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { gql, useQuery } from "@apollo/client";
import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import jwtDecode from "jwt-decode";

import { setInitialState } from "../store";
import { getAppInsights } from "../TelemetryService";

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

interface Props {}

const WithAuthenticatedUser: React.FC<Props> = ({ children }) => {
  const appInsights = getAppInsights();
  const dispatch = useDispatch();
  const location = useLocation();
  const accessToken = localStorage.getItem("access_token");

  // Check if the user is logged in, if not redirect to Okta
  if (process.env.REACT_APP_OKTA_ENABLED === "true") {
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

  return <>{children}</>;
};

export default connect()(WithAuthenticatedUser);
