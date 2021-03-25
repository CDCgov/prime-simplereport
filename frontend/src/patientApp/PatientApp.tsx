import React, {
  FunctionComponent,
  useEffect,
  Component as ReactComponent,
} from "react";
import { ToastContainer } from "react-toastify";
import { useDispatch, connect, useSelector } from "react-redux";
import "react-toastify/dist/ReactToastify.css";
import {
  Route,
  Switch,
  BrowserRouter as Router,
  Redirect,
} from "react-router-dom";
import { AppInsightsContext } from "@microsoft/applicationinsights-react-js";

import { reactPlugin } from "../app/AppInsights";
import PrimeErrorBoundary from "../app/PrimeErrorBoundary";
import USAGovBanner from "../app/commonComponents/USAGovBanner";
import { setInitialState } from "../app/store";
import { getPatientLinkIdFromUrl } from "../app/utils/url";

import PatientHeader from "./PatientHeader";
import TermsOfService from "./timeOfTest/TermsOfService";
import DOB from "./timeOfTest/DOB";
import AoEPatientFormContainer from "./timeOfTest/AoEPatientFormContainer";
import PatientLanding from "./timeOfTest/PatientLanding";
import PatientProfileContainer from "./timeOfTest/PatientProfileContainer";
import PatientFormContainer from "./timeOfTest/PatientFormContainer";
import TestResult from "./timeOfTest/TestResult";
import Patient404 from "./timeOfTest/Patient404";

interface WrapperProps {
  plid: string;
}
const PatientLinkURL404Wrapper: FunctionComponent<WrapperProps> = ({
  plid,
  children,
}) => {
  if (plid === undefined) {
    return <>Loading...</>;
  }
  if (plid === null) {
    return <Patient404 />;
  }
  return <>{children}</>;
};

// const GuardedRoute =  ({ render, component: Component, auth, ...rest }: any) => (
//   <Route {...rest} render={(props) => (
//       auth === true
//           ? <Component {...props} />
//           : <Redirect to='/' />
//   )} />
// );

const PatientApp = () => {
  const dispatch = useDispatch();
  const plid = useSelector((state: any) => state.plid);
  const patient = useSelector((state: any) => state.patient);

  if (plid) {
    window.history.replaceState(
      {},
      document.title,
      window.location.origin + window.location.pathname + `?plid=${plid}`
    );
    //   window.location.search = `plid=${plid}`;
  }

  useEffect(() => {
    dispatch(
      setInitialState({
        plid: getPatientLinkIdFromUrl(),
      })
    );
  });

  return (
    <AppInsightsContext.Provider value={reactPlugin}>
      <PrimeErrorBoundary
        onError={(error: any) => (
          <div>
            <h1> There was an error. Please try refreshing</h1>
            <pre> {JSON.stringify(error, null, 2)} </pre>
          </div>
        )}
      >
        <div className="App">
          <div id="main-wrapper">
            <USAGovBanner />
            <PatientHeader />
            <PatientLinkURL404Wrapper plid={plid}>
              <Router basename={`${process.env.PUBLIC_URL}/pxp`}>
                <Switch>
                  <Route
                    path="/"
                    exact
                    render={(props) => (
                      <TermsOfService {...(props.location.state as any)} />
                    )}
                  />
                  <Route path="/terms-of-service" component={TermsOfService} />
                  <Route
                    path="/birth-date-confirmation"
                    render={(props) => (
                      <DOB {...(props.location.state as any)} />
                    )}
                  />
                  <Route
                    path="/patient-info-confirm"
                    render={(props) => (
                      <PatientProfileContainer
                        {...(props.location.state as any)}
                      />
                    )}
                  />
                  <Route
                    path="/patient-info-edit"
                    render={(props) => (
                      <PatientFormContainer
                        {...(props.location.state as any)}
                      />
                    )}
                  />
                  <Route
                    path="/patient-info-symptoms"
                    render={(props) => (
                      <AoEPatientFormContainer
                        {...(props.location.state as any)}
                      />
                    )}
                  />
                  <Route path="/success" component={PatientLanding} />
                  <Route path="/test-result" component={TestResult} />
                </Switch>
              </Router>
              <ToastContainer
                autoClose={5000}
                closeButton={false}
                limit={2}
                position="bottom-center"
                hideProgressBar={true}
              />
            </PatientLinkURL404Wrapper>
          </div>
        </div>
      </PrimeErrorBoundary>
    </AppInsightsContext.Provider>
  );
};

export default connect()(PatientApp);
