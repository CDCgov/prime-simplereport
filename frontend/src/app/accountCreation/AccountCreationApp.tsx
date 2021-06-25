import { FunctionComponent, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Switch, RouteComponentProps } from "react-router-dom";

import PrimeErrorBoundary from "../PrimeErrorBoundary";
import Page from "../commonComponents/Page/Page";
import { RootState, setInitialState } from "../store";
import { getActivationTokenFromUrl } from "../utils/url";
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

interface WrapperProps {
  activationToken: string;
}
const AccountCreation404Wrapper: FunctionComponent<WrapperProps> = ({
  activationToken,
  children,
}) => {
  if (activationToken === undefined) {
    return <>Loading...</>;
  }
  if (activationToken === null) {
    return <PageNotFound />;
  }
  return <>{children}</>;
};

const AccountCreationApp: React.FC<RouteComponentProps> = ({ match }) => {
  const dispatch = useDispatch();
  const activationToken = useSelector<RootState, string>(
    (state) => state.activationToken
  );

  useEffect(() => {
    dispatch(
      setInitialState({
        activationToken: getActivationTokenFromUrl(),
      })
    );
  }, [dispatch]);

  return (
    <PrimeErrorBoundary>
      <Page>
        <AccountCreation404Wrapper activationToken={activationToken}>
          <Switch>
            <Route path={match.path} exact component={PasswordForm} />
            <Route
              path={`${match.path}/set-password`}
              component={PasswordForm}
            />
            <Route
              path={`${match.path}/set-recovery-question`}
              component={SecurityQuestion}
            />
            <Route path={`${match.path}/mfa-select`} component={MfaSelect} />
            <Route
              path={`${match.path}/mfa-sms/verify`}
              component={MfaSmsVerify}
            />
            <Route path={`${match.path}/mfa-sms`} component={MfaSms} />
            <Route
              path={`${match.path}/mfa-okta/verify`}
              component={MfaOktaVerify}
            />
            <Route path={`${match.path}/mfa-okta`} component={MfaOkta} />
            <Route
              path={`${match.path}/mfa-google-auth/verify`}
              component={MfaGoogleAuthVerify}
            />
            <Route
              path={`${match.path}/mfa-google-auth`}
              component={MfaGoogleAuth}
            />
            <Route
              path={`${match.path}/mfa-security-key`}
              component={MfaSecurityKey}
            />
            <Route
              path={`${match.path}/mfa-phone/verify`}
              component={MfaPhoneVerify}
            />
            <Route path={`${match.path}/mfa-phone`} component={MfaPhone} />
            <Route
              path={`${match.path}/mfa-email/verify`}
              component={MfaEmailVerify}
            />
            <Route path={`${match.path}/success`} component={MfaComplete} />
          </Switch>
        </AccountCreation404Wrapper>
      </Page>
    </PrimeErrorBoundary>
  );
};

export default AccountCreationApp;
