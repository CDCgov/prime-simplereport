import { Route, Routes } from "react-router-dom";

import Page from "../commonComponents/Page/Page";

import Consent from "./IdentityVerification/Consent";
import SignUpGoals from "./Organization/SignUpGoals";

const SignUpApp = () => {
  return (
    <Page>
      <main>
        <Routes>
          <Route path="/" element={<SignUpGoals />} />
          <Route path={"identity-verification"} element={<Consent />} />
        </Routes>
      </main>
    </Page>
  );
};

export default SignUpApp;
