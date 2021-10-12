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
      window.location.href = `${
        process.env.REACT_APP_OKTA_URL
      }/oauth2/default/v1/authorize?client_id=${
        process.env.REACT_APP_OKTA_CLIENT_ID
      }&redirect_uri=${getUrl()}&response_type=token id_token&scope=openid simple_report simple_report_test&nonce=thisisnotsafe&state=thisisbogus`;
      return false;
    }

    return this.props.children;
  }
}
