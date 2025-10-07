import React, { ErrorInfo } from "react";

import ErrorPage from "./commonComponents/ErrorPage";
import { getAppInsights } from "./TelemetryService";
import { getUrl, stripIdTokenFromOktaRedirectUri } from "./utils/url";

interface ErrorBoundaryState {
  hasError: boolean;
  redirectToOkta: boolean;
}

interface PrimeErrorBoundaryProps {
  children?: React.ReactNode;
}

export default class PrimeErrorBoundary extends React.Component<
  PrimeErrorBoundaryProps,
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
      const url = `${
        import.meta.env.VITE_OKTA_URL
      }/oauth2/default/v1/authorize`;
      const clientId = `?client_id=${import.meta.env.VITE_OKTA_CLIENT_ID}`;
      const sanitizedRedirectUri = stripIdTokenFromOktaRedirectUri(getUrl());
      const redirectUri = `&redirect_uri=${encodeURIComponent(
        sanitizedRedirectUri
      )}`;

      const responseType = `&response_type=${encodeURIComponent(
        "token id_token"
      )}`;
      const scope =
        "&scope=" +
        encodeURIComponent(
          `openid simple_report ${import.meta.env.VITE_OKTA_SCOPE}`
        );
      const nonce = "&nonce=thisisnotsafe";
      const state = "&state=thisisbogus";
      window.location.href =
        url + clientId + redirectUri + responseType + scope + nonce + state;
      return false;
    }

    //@ts-ignore props children not property of read only
    return this.props.children;
  }
}
