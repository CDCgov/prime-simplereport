import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Route,
  Switch,
  BrowserRouter as Router,
  RouteComponentProps,
  useHistory,
} from "react-router-dom";

import PrimeErrorBoundary from "../PrimeErrorBoundary";
import Page from "../commonComponents/Page/Page";
import { RootState, setInitialState, setUserAccountStatus } from "../store";
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

const AccountCreationApp: React.FC<RouteComponentProps<{}>> = ({ match }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const userAccountStatus = useSelector<RootState, UserAccountStatus>(
    (state) => state.userAccountStatus
  );

  // Runs once on app load
  useEffect(() => {
    const getStatusAndActivate = async (
      activationToken: string | null = null
    ) => {
      // Ask backend what the user's current account creation status is
      let userAccountStatus = await AccountCreationApi.getUserStatus(
        activationToken
      );
      // Set it on the redux store
      dispatch(
        setInitialState({
          activationToken,
          userAccountStatus,
        })
      );
      // If the user hasn't been activated yet w/ the activation token, do so
      if (
        userAccountStatus === UserAccountStatus.PENDING_ACTIVATION &&
        activationToken
      ) {
        await AccountCreationApi.initialize(activationToken);
        // Re-retrieve the status since it will have changed after activation
        userAccountStatus = await AccountCreationApi.getUserStatus();
        dispatch(setUserAccountStatus(userAccountStatus));
      }
      // Set correct path based on status
      const path = routeFromStatus(userAccountStatus);
      const route = `/uac${path}`;
      if (route !== history.location.pathname) {
        history.push(route);
        history.go(0);
      }
    };
    const activationToken = getActivationTokenFromUrl();
    getStatusAndActivate(activationToken);
  }, [dispatch, history]);

  if (
    userAccountStatus === UserAccountStatus.LOADING ||
    userAccountStatus === UserAccountStatus.PENDING_ACTIVATION
  ) {
    return <LoadingCard />;
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
            <Route path="/not-found" component={PageNotFound} />
          </Switch>
        </Router>
      </Page>
    </PrimeErrorBoundary>
  );
};

export default AccountCreationApp;
