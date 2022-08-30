import { Route, Routes } from "react-router-dom";
import { useState } from "react";

import Page from "../commonComponents/Page/Page";

import Consent from "./IdentityVerification/Consent";
import SignUpGoals from "./Organization/SignUpGoals";

const SignUpApp = () => {
  const [datePickerActive, setDatePickerActive] = useState(false);

  const observe = () => {
    try {
      const targetNode = document.querySelector(
        '[data-testid="date-picker-calendar"]'
      );
      if (!targetNode) {
        // try to find the target again if the page hasn't finished loading.
        window.setTimeout(observe, 500);
        return;
      }
      const config = {
        attributes: true,
        attributeOldValue: true,
        attributeFilter: ["hidden"],
      };

      const callback = (
        mutationList: MutationRecord[],
        observer: MutationObserver
      ) => {
        // if old value is empty string, hidden attribute has been removed. Calendar is now visible.
        // if old value is null, hidden attribute is being added. Calendar is now invisible.
        const isCalendarActive = mutationList.some(
          (m) => m.type === "attributes" && m.oldValue === ""
        );
        setDatePickerActive(isCalendarActive);
      };

      const observer = new MutationObserver(callback);

      observer.observe(targetNode as Node, config);
    } catch (e) {}
  };
  observe();
  return (
    <Page isModalActive={datePickerActive}>
      <Routes>
        <Route path="/" element={<SignUpGoals />} />
        <Route
          path={"identity-verification"}
          element={<Consent isModalActive={datePickerActive} />}
        />
      </Routes>
    </Page>
  );
};

export default SignUpApp;
