import { useEffect, useState } from "react";
import {
  Route,
  Switch,
  BrowserRouter as Router,
  useHistory,
} from "react-router-dom";

import PrimeErrorBoundary from "../PrimeErrorBoundary";
import Page from "../commonComponents/Page/Page";
import { getActivationTokenFromUrl } from "../utils/url";
import { LoadingCard } from "../commonComponents/LoadingCard/LoadingCard";
import PageNotFound from "../commonComponents/PageNotFound";

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
  // Used to reroute based on user's status
  const history = useHistory();

  // Runs once on app load
  useEffect(() => {
    const getStatusAndActivate = async (
      activationToken: string | null = null
    ) => {
      // Ask backend what the user's current account creation status is
      let status = await AccountCreationApi.getUserStatus(activationToken);
      // If the user hasn't been activated yet w/ the activation token, do so
      if (status === UserAccountStatus.PENDING_ACTIVATION && activationToken) {
        await AccountCreationApi.initialize(activationToken);
        // Re-retrieve the status since it will have changed after activation
        status = await AccountCreationApi.getUserStatus();
      }
      // Get correct path based on status
      const newPath = routeFromStatus(status);
      // Check what current path is
      const mount = history.location.pathname.split("/uac")[0];
      const currentPath = history.location.pathname.split("/uac")[1];
      // If new path is different, reroute
      if (newPath !== currentPath) {
        history.push(`${mount}/uac${newPath}`);
      }
      // Set the userAccountStatus state, triggering a rerender w/ the Router
      setUserAccountStatus(status);
    };
    const token = getActivationTokenFromUrl();
    getStatusAndActivate(token);
  }, [history, userAccountStatus]);

  // Show loading card while useEffect func is running
  if (userAccountStatus === UserAccountStatus.LOADING) {
    return <LoadingCard />;
  }

  return (
    <PrimeErrorBoundary>
      <Page>
        <Router basename={`${process.env.PUBLIC_URL}/uac`}>
          <Switch>
            <Route path="/" exact component={PasswordForm} />
            <Route path="/set-password" component={PasswordForm} />
            <Route path="/set-recovery-question" component={SecurityQuestion} />
            <Route path="/mfa-select" component={MfaSelect} />
            <Route path="/mfa-sms/verify" component={MfaSmsVerify} />
            <Route path="/mfa-sms" component={MfaSms} />
            <Route path="/mfa-okta/verify" component={MfaOktaVerify} />
            <Route path="/mfa-okta" component={MfaOkta} />
            <Route
              path="/mfa-google-auth/verify"
              component={MfaGoogleAuthVerify}
            />
            <Route path="/mfa-google-auth" component={MfaGoogleAuth} />
            <Route path="/mfa-security-key" component={MfaSecurityKey} />
            <Route path="/mfa-phone/verify" component={MfaPhoneVerify} />
            <Route path="/mfa-phone" component={MfaPhone} />
            <Route path="/mfa-email/verify" component={MfaEmailVerify} />
            <Route path="/success" component={MfaComplete} />
            <Route path="/not-found" component={PageNotFound} />
          </Switch>
        </Router>
      </Page>
    </PrimeErrorBoundary>
  );
};

export default AccountCreationApp;
