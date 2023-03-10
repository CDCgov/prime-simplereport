import { Route, Routes } from "react-router-dom";
import { useEffect } from "react";

import Page from "../commonComponents/Page/Page";
import { getAppInsights } from "../TelemetryService";

import Consent from "./IdentityVerification/Consent";
import SignUpGoals from "./Organization/SignUpGoals";

const SignUpApp = () => {
  const appInsights = getAppInsights();
  useEffect(() => {
    if (window?.visualViewport?.width) {
      appInsights?.trackMetric(
        {
          name: "userViewport_signUp",
          average: window?.visualViewport?.width,
        },
        {
          width: window?.visualViewport?.width,
          height: window?.visualViewport?.height,
        }
      );
    }
  }, [appInsights]);

  return (
    <Page>
      <Routes>
        <Route path="/" element={<SignUpGoals />} />
        <Route path={"identity-verification"} element={<Consent />} />
      </Routes>
    </Page>
  );
};

export default SignUpApp;
