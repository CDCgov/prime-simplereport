import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Route,
  Switch,
  BrowserRouter as Router,
  RouteComponentProps,
} from "react-router-dom";

import PrimeErrorBoundary from "../PrimeErrorBoundary";
import Page from "../commonComponents/Page/Page";
import { RootState, setInitialState } from "../store";
import { getActivationTokenFromUrl } from "../utils/url";
import { LoadingCard } from "../commonComponents/LoadingCard/LoadingCard";

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

const AccountCreationApp: React.FC<RouteComponentProps<{}>> = ({ match }) => {
  // State for whether this is the initial load of the app
  // If it is, we will redirect to the correct route based on the user's status
  const [initialLoad, setInitialLoad] = useState(true);

  const dispatch = useDispatch();
  const userAccountStatus = useSelector<RootState, UserAccountStatus>(
    (state) => state.userAccountStatus
  );

  // On initial load, ask backend what the user's status is, and
  // activate the user if they haven't been yet
  useEffect(() => {
    const getStatus = async (activationToken: string | null) => {
      const userAccountStatus = await AccountCreationApi.getUserStatus(
        activationToken
      );
      dispatch(
        setInitialState({
          activationToken,
          userAccountStatus,
        })
      );
      return userAccountStatus;
    };
    const activateUser = async (
      statusPromise: Promise<UserAccountStatus>,
      activationToken: string | null
    ) => {
      console.log("Starting activateUser...");
      const status = await statusPromise;
      console.log("Got status: ", status);
      console.log("Activation token: ", activationToken);
      if (status === UserAccountStatus.PENDING_ACTIVATION && activationToken) {
        console.log("Making initialize request...");
        await AccountCreationApi.initialize(activationToken);
      }
    };
    const activationToken = getActivationTokenFromUrl();
    console.log("Getting status...");
    const statusPromise = getStatus(activationToken);
    console.log("Got status...");
    activateUser(statusPromise, activationToken);
  }, [dispatch]);

  if (
    userAccountStatus === UserAccountStatus.LOADING ||
    userAccountStatus === UserAccountStatus.PENDING_ACTIVATION
  ) {
    return <LoadingCard />;
  } else if (initialLoad) {
    setInitialLoad(false);
    return routeFromStatus(userAccountStatus);
  }

  return (
    <PrimeErrorBoundary>
      <Page>
        <Router basename={match.url}>
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
          </Switch>
        </Router>
      </Page>
    </PrimeErrorBoundary>
  );
};

export default AccountCreationApp;
