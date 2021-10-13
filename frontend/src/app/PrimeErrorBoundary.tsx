import React, { ErrorInfo } from "react";

import ErrorPage from "./commonComponents/ErrorPage";
import { getAppInsights } from "./TelemetryService";
import { getUrl } from "./utils/url";

interface ErrorBoundaryState {
  hasError: boolean;
  redirectToOkta: boolean;
}

export default class PrimeErrorBoundary extends React.Component<
  {},
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, redirectToOkta: false };
  }

  static getDerivedStateFromError(error: Error) {
    if (error.message === "Not authenticated, redirecting to Okta...") {
      return { redirectToOkta: true };
    }
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (error.message === "Not authenticated, redirecting to Okta...") {
      return;
    }

    const appInsights = getAppInsights();
    if (appInsights) {
      appInsights.trackException({
        exception: new Error("PrimeErrorBoundary: " + error),
        severityLevel: 3,
        properties: { componentStack: info.componentStack },
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorPage />;
    }

    if (this.state.redirectToOkta) {
      const url = `${process.env.REACT_APP_OKTA_URL}/oauth2/default/v1/authorize`;
      const clientId = `?client_id=${process.env.REACT_APP_OKTA_CLIENT_ID}`;
      const redirectUri = `&redirect_uri=${encodeURIComponent(getUrl())}`;
      const responseType = `&response_type=${encodeURIComponent(
        "token id_token"
      )}`;
      const scope =
        "&scope=" +
        encodeURIComponent(
          `openid simple_report ${process.env.REACT_APP_OKTA_SCOPE}`
        );
      const nonce = "&nonce=thisisnotsafe";
      const state = "&state=thisisbogus";
      window.location.href =
        url + clientId + redirectUri + responseType + scope + nonce + state;
      return false;
    }

    return this.props.children;
  }
}
