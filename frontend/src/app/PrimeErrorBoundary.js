import React from "react";

// import { SeverityLevel } from "@microsoft/applicationinsights-web";
import ErrorPage from "./commonComponents/ErrorPage";
import { getAppInsights } from "./TelemetryService";

export default class PrimeErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  componentDidCatch(error, info) {
    this.setState({ hasError: true, error });
    const appInsights = getAppInsights();
    if (appInsights) {
      getAppInsights().trackException({
        error: error,
        //   exception: error,
        //   severityLevel: SeverityLevel.Error,
        properties: { ...info },
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return React.createElement(ErrorPage);
    }

    return this.props.children;
  }
}
