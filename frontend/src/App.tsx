import React from "react";
import { Provider } from "react-redux";
import {
  ApolloClient,
  ApolloProvider,
  ApolloLink,
  InMemoryCache,
  concat,
} from "@apollo/client";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  Navigate,
} from "react-router-dom";
import { createUploadLink } from "apollo-upload-client";
import { ErrorResponse, onError } from "@apollo/client/link/error";
import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import Modal from "react-modal";

import ReportingApp from "./app/ReportingApp";
import PatientApp from "./patientApp/PatientApp";
import AccountCreationApp from "./app/accountCreation/AccountCreationApp";
import SignUpApp from "./app/signUp/SignUpApp";
import HealthChecks from "./app/HealthChecks";
import { store } from "./app/store";
import { showError } from "./app/utils/srToast";
import {
  getAppInsights,
  ai,
  withInsights,
  getAppInsightsHeaders,
} from "./app/TelemetryService";
import TelemetryProvider from "./app/telemetry-provider";
import { SelfRegistration } from "./patientApp/selfRegistration/SelfRegistration";
import "./i18n";
import getNodeEnv from "./app/utils/getNodeEnv";
import PrimeErrorBoundary from "./app/PrimeErrorBoundary";
import "./scss/App.scss";
import { getUrl } from "./app/utils/url";
import SessionTimeout from "./app/accountCreation/SessionTimeout";
import WithFeatureFlags from "./featureFlags/WithFeatureFlags";
import { getBody, getHeader } from "./app/utils/srGraphQLErrorMessage";

// Initialize telemetry early
ai.initialize();
withInsights(console);

// Define the root element for modals
if (getNodeEnv() !== "test") {
  Modal.setAppElement("#root");
}

if (window.location.hash) {
  const params = new URLSearchParams(window.location.hash.slice(1));
  const bearerToken = params.get("access_token");
  if (bearerToken) {
    localStorage.setItem("access_token", bearerToken);
  }
  // We need to store the ID token in order for logout to work correctly.
  const idToken = params.get("id_token");
  if (idToken) {
    localStorage.setItem("id_token", idToken);
  }
}

const httpLink = createUploadLink({
  uri: `${import.meta.env.VITE_BACKEND_URL}/graphql`,
});

const apolloMiddleware = new ApolloLink((operation, forward) => {
  operation.setContext({
    headers: {
      // Auth headers
      "Access-Control-Request-Headers": "Authorization",
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      // App Insight headers
      ...getAppInsightsHeaders(),
    },
  });
  return forward(operation);
});

const logoutLink = onError(({ networkError, graphQLErrors }: ErrorResponse) => {
  if (networkError && import.meta.env.VITE_BASE_URL) {
    // If unauthorized (expired or missing token), remove the access token and reload
    if ("statusCode" in networkError && networkError.statusCode === 401) {
      console.warn("[UNATHORIZED_ACCESS] !!");
      localStorage.removeItem("access_token");
      const appUrl = getUrl();
      console.warn("redirect-to:", appUrl);
      window.location.replace(appUrl);
    } else {
      const appInsights = getAppInsights();
      if (appInsights instanceof ApplicationInsights) {
        appInsights.trackException({
          exception: networkError,
          properties: {
            "user message": `${networkError.message} Please check for errors and try again`,
          },
        });
      }
      showError("Please check for errors and try again", networkError.message);
    }
  }
  if (graphQLErrors) {
    graphQLErrors.map(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
      showError(getBody(message), getHeader(message));
      return message;
    });
    console.error("graphql error", graphQLErrors);
  }
});

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: logoutLink.concat(concat(apolloMiddleware, httpLink as any)),
});

export const ReactApp = () => (
  <ApolloProvider client={client}>
    <React.StrictMode>
      <Provider store={store}>
        <WithFeatureFlags>
          <Router basename={import.meta.env.VITE_PUBLIC_URL}>
            <TelemetryProvider>
              <PrimeErrorBoundary>
                <Routes>
                  <Route path="/health/*" element={<HealthChecks />} />
                  <Route path="/pxp/*" element={<PatientApp />} />
                  <Route path="/uac/*" element={<AccountCreationApp />} />
                  <Route path="/sign-up/*" element={<SignUpApp />} />
                  <Route
                    path="/register/:registrationLink"
                    element={<SelfRegistration />}
                  />
                  <Route path="/session-timeout" element={<SessionTimeout />} />
                  <Route path="/reload-app" element={<Navigate to="/" />} />
                  <Route path="/*" element={<ReportingApp />} />
                  <Route element={<>Page not found</>} />
                </Routes>
              </PrimeErrorBoundary>
            </TelemetryProvider>
          </Router>
        </WithFeatureFlags>
      </Provider>
    </React.StrictMode>
  </ApolloProvider>
);
