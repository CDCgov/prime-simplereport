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
import { LoadingCard } from "./LoadingCard/LoadingCard";

const AccountCreationApp: React.FC<RouteComponentProps<{}>> = ({ match }) => {
  const dispatch = useDispatch();
  const [initialLoad, setInitialLoad] = useState(true);
  const userAccountStatus = useSelector<RootState, UserAccountStatus>(
    (state) => state.userAccountStatus
  );

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
    };
    const activationToken = getActivationTokenFromUrl();
    getStatus(activationToken);
  }, [dispatch]);

  if (userAccountStatus === UserAccountStatus.LOADING) {
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
