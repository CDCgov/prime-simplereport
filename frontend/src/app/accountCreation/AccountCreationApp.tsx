import { FunctionComponent, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { useDispatch, connect, useSelector } from "react-redux";
import "react-toastify/dist/ReactToastify.css";
import { Route, Switch, BrowserRouter as Router } from "react-router-dom";
import { AppInsightsContext } from "@microsoft/applicationinsights-react-js";

import { reactPlugin } from "../AppInsights";
import PrimeErrorBoundary from "../PrimeErrorBoundary";
import USAGovBanner from "../commonComponents/USAGovBanner";
import { setInitialState } from "../store";
import { getActivationTokenFromUrl } from "../utils/url";
import PageNotFound from "../commonComponents/PageNotFound";

import { PasswordForm } from "./PasswordForm/PasswordForm";
import { SecurityQuestion } from "./SecurityQuestion/SecurityQuestion";
import { MfaSelect } from "./MfaSelect/MfaSelect";
import { MfaSms } from "./MfaSms/MfaSms";
import { MfaComplete } from "./MfaComplete/MfaComplete";

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

const AccountCreationApp = () => {
  const dispatch = useDispatch();
  const activationToken = useSelector((state: any) => state.activationToken);

  useEffect(() => {
    dispatch(
      setInitialState({
        activationToken: getActivationTokenFromUrl(),
      })
    );
  });

  return (
    <AppInsightsContext.Provider value={reactPlugin}>
      <PrimeErrorBoundary>
        <div className="App">
          <div id="main-wrapper">
            <USAGovBanner />
            <AccountCreation404Wrapper activationToken={activationToken}>
              <Router basename={`${process.env.PUBLIC_URL}/uac`}>
                <Switch>
                  <Route path="/set-password" exact component={PasswordForm} />
                  <Route
                    path="/set-recovery-question"
                    component={SecurityQuestion}
                  />
                  <Route path="/mfa-select" component={MfaSelect} />
                  <Route path="/mfa-sms-verify" component={MfaSms} />
                  <Route path="/success" component={MfaComplete} />
                </Switch>
              </Router>
              <ToastContainer
                autoClose={5000}
                closeButton={false}
                limit={2}
                position="bottom-center"
                hideProgressBar={true}
              />
            </AccountCreation404Wrapper>
          </div>
        </div>
      </PrimeErrorBoundary>
    </AppInsightsContext.Provider>
  );
};

export default connect()(AccountCreationApp);
