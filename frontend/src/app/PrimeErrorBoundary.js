import React from "react";

// import { SeverityLevel } from "@microsoft/applicationinsights-web";
import { appInsights } from "./AppInsights";
import ErrorPage from "./commonComponents/ErrorPage";

export default class PrimeErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  componentDidCatch(error, info) {
    this.setState({ hasError: true, error });
    appInsights.trackException({
      error: error,
      //   exception: error,
      //   severityLevel: SeverityLevel.Error,
      properties: { ...info },
    });
  }

  render() {
    if (this.state.hasError) {
      return React.createElement(ErrorPage);
    }

    return this.props.children;
  }
}
