import { Route, Routes } from "react-router-dom";
import { useState } from "react";

import Page from "../commonComponents/Page/Page";
import { observeDatePicker } from "../utils/observeDatePicker";

import Consent from "./IdentityVerification/Consent";
import SignUpGoals from "./Organization/SignUpGoals";

const SignUpApp = () => {
  const [modalActive, setModalActive] = useState(false);

  observeDatePicker('[data-testid="date-picker-calendar"]', setModalActive);
  return (
    <Page isModalActive={modalActive}>
      <Routes>
        <Route path="/" element={<SignUpGoals />} />
        <Route
          path={"identity-verification"}
          element={<Consent isModalActive={modalActive} />}
        />
      </Routes>
    </Page>
  );
};

export default SignUpApp;
