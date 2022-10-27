import { Route, Routes } from "react-router-dom";

import Page from "../commonComponents/Page/Page";

import Consent from "./IdentityVerification/Consent";
import SignUpGoals from "./Organization/SignUpGoals";

const SignUpApp = () => {
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
