import React, { FunctionComponent, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { useDispatch, connect, useSelector } from "react-redux";
import "react-toastify/dist/ReactToastify.css";
import { Route, Switch, BrowserRouter as Router } from "react-router-dom";
import { AppInsightsContext } from "@microsoft/applicationinsights-react-js";
import { reactPlugin } from "../app/AppInsights";

import PrimeErrorBoundary from "../app/PrimeErrorBoundary";
import USAGovBanner from "../app/commonComponents/USAGovBanner";
import { setInitialState } from "../app/store";
import { getPatientLinkIdFromUrl } from "../app/utils/url";
import PatientHeader from "./PatientHeader";
import DOB from "./timeOfTest/DOB";
import AoEPatientFormContainer from "./timeOfTest/AoEPatientFormContainer";
import PatientLanding from "./timeOfTest/PatientLanding";
import PatientProfileContainer from "./timeOfTest/PatientProfileContainer";
import PatientFormContainer from "./timeOfTest/PatientFormContainer";
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

const PatientApp = () => {
  const dispatch = useDispatch();
  const plid = useSelector((state: any) => state.plid);

  useEffect(() => {
    dispatch(
      setInitialState({
        plid: getPatientLinkIdFromUrl(),
      })
    );
  }, [dispatch]);

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
                      <DOB {...(props.location.state as any)} />
                    )}
                  />
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
