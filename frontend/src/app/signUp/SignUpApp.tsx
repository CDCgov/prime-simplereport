import { Route, Routes } from "react-router-dom";
import { useState } from "react";

import Page from "../commonComponents/Page/Page";
import { observeDatePicker } from "../utils/observeDatePicker";

import Consent from "./IdentityVerification/Consent";
import SignUpGoals from "./Organization/SignUpGoals";

const SignUpApp = () => {
  const [modalActive, setModalActive] = useState(false);

  observeDatePicker(
    '.usa-date-picker__calendar[role="dialog"]',
    setModalActive
  );
  return (
    <Page isModalActive={modalActive}>
      <main>
        <Routes>
          <Route path="/" element={<SignUpGoals />} />
          <Route
            path={"identity-verification"}
            element={<Consent isModalActive={modalActive} />}
          />
        </Routes>
      </main>
    </Page>
  );
};

export default SignUpApp;
