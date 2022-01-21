import { useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";

import Page from "../commonComponents/Page/Page";
import { getActivationTokenFromUrl } from "../utils/url";
import { LoadingCard } from "../commonComponents/LoadingCard/LoadingCard";
import PageNotFound from "../commonComponents/PageNotFound";
import CardBackground from "../commonComponents/CardBackground/CardBackground";
import Card from "../commonComponents/Card/Card";

import { SecurityQuestion } from "./SecurityQuestion/SecurityQuestion";
import { MfaSelect } from "./MfaSelect/MfaSelect";
import { MfaSms } from "./MfaSms/MfaSms";
import { MfaComplete } from "./MfaComplete/MfaComplete";
import { MfaOkta } from "./MfaOkta/MfaOkta";
import { MfaGoogleAuth } from "./MfaGoogleAuth/MfaGoogleAuth";
import { MfaSecurityKey } from "./MfaSecurityKey/MfaSecurityKey";
import { MfaSmsVerify } from "./MfaSmsVerify/MfaSmsVerify";
import { MfaEmailVerify } from "./MfaEmailVerify/MfaEmailVerify";
import { MfaPhone } from "./MfaPhone/MfaPhone";
import { MfaPhoneVerify } from "./MfaPhoneVerify/MfaPhoneVerify";
import { MfaOktaVerify } from "./MfaOktaVerify/MfaOktaVerify";
import { MfaGoogleAuthVerify } from "./MfaGoogleAuthVerify/MfaGoogleAuthVerify";
import { PasswordForm } from "./PasswordForm/PasswordForm";
import { AccountCreationApi } from "./AccountCreationApiService";
import { routeFromStatus, UserAccountStatus } from "./UserAccountStatus";

const AccountCreationApp = () => {
  // Initialize to loading state on app load
  const [userAccountStatus, setUserAccountStatus] = useState(
    UserAccountStatus.LOADING
  );
  const [error, setError] = useState("");
  // Used to reroute based on user's status
  const navigate = useNavigate();
  const location = useLocation();

  // Runs once on app load
  useEffect(() => {
    const getStatusAndActivate = async (
      activationToken: string | null = null
    ) => {
      // Ask backend what the user's current account creation status is
      let status = await AccountCreationApi.getUserStatus(activationToken);
      // If the user hasn't been activated yet w/ the activation token, do so
      if (status === UserAccountStatus.PENDING_ACTIVATION && activationToken) {
        try {
          await AccountCreationApi.initialize(activationToken);
        } catch (error: any) {
          setError(error || "Invalid activation token");
        }
        // Re-retrieve the status since it will have changed after activation
        status = await AccountCreationApi.getUserStatus();
      }
      // Get correct path based on status
      const newPath = routeFromStatus(status);
      // Check what current path is
      const currentPath = location.pathname.split("/uac/")[1];
      // If new path is different, reroute
      if (newPath !== currentPath) {
        navigate(newPath);
      }
      // Set the userAccountStatus state, triggering a rerender w/ the Router
      setUserAccountStatus(status);
    };
    const token = getActivationTokenFromUrl();
    getStatusAndActivate(token);
  }, [navigate, location]);

  // Show loading card while useEffect func is running
  if (userAccountStatus === UserAccountStatus.LOADING) {
    return <LoadingCard />;
  }

  // Show error card if activation token is invalid
  if (error && error.includes("activat")) {
    return (
      <CardBackground>
        <Card
          logo
          bodyKicker={"Your SimpleReport account invitation has expired"}
        >
          <p>
            Contact your organization administrator for a new account setup
            email.
          </p>

          <p>
            Not sure who your organization administrator is? Email{" "}
            <a href="mailto:support@simplereport.gov">
              support@simplereport.gov
            </a>
            .
          </p>
        </Card>
      </CardBackground>
    );
  }
  // show generic error card for other errors
  else if (error) {
    return (
      <CardBackground>
        <Card logo bodyKicker={error} bodyKickerCentered={true}></Card>
      </CardBackground>
    );
  }

  return (
    <Page>
      <Routes>
        <Route path="/" element={<PasswordForm />} />
        <Route path="set-password" element={<PasswordForm />} />
        <Route path="set-recovery-question" element={<SecurityQuestion />} />
        <Route path="mfa-select" element={<MfaSelect />} />
        <Route path="mfa-sms/verify" element={<MfaSmsVerify />} />
        <Route path="mfa-sms" element={<MfaSms />} />
        <Route path="mfa-okta/verify" element={<MfaOktaVerify />} />
        <Route path="mfa-okta" element={<MfaOkta />} />
        <Route
          path="mfa-google-auth/verify"
          element={<MfaGoogleAuthVerify />}
        />
        <Route path="mfa-google-auth" element={<MfaGoogleAuth />} />
        <Route path="mfa-security-key" element={<MfaSecurityKey />} />
        <Route path="mfa-phone/verify" element={<MfaPhoneVerify />} />
        <Route path="mfa-phone" element={<MfaPhone />} />
        <Route path="mfa-email/verify" element={<MfaEmailVerify />} />
        <Route path="success" element={<MfaComplete />} />
        <Route path="not-found" element={<PageNotFound />} />
      </Routes>
    </Page>
  );
};

export default AccountCreationApp;
