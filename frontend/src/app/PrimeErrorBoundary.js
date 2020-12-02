import React from "react";
// import { SeverityLevel } from "@microsoft/applicationinsights-web";
import { appInsights } from "./AppInsights";

export default class PrimeErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  componentDidCatch(error, info) {
    console.log("info:", info);
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
      const { onError } = this.props;
      return typeof onError === "function"
        ? onError(this.state.error)
        : React.createElement(onError);
    }

    return this.props.children;
  }
}
