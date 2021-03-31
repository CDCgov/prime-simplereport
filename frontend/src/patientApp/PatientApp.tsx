import { FunctionComponent, useEffect } from "react";
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
import ErrorPage from "../app/commonComponents/ErrorPage";

import PatientHeader from "./PatientHeader";
import TermsOfService from "./timeOfTest/TermsOfService";
import DOB from "./timeOfTest/DOB";
import AoEPatientFormContainer from "./timeOfTest/AoEPatientFormContainer";
import PatientLanding from "./timeOfTest/PatientLanding";
import PatientProfileContainer from "./timeOfTest/PatientProfileContainer";
import PatientFormContainer from "./timeOfTest/PatientFormContainer";
import TestResult from "./timeOfTest/TestResult";
import Patient404 from "./timeOfTest/Patient404";
import GuardedRoute from "./GuardedRoute";

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
  const patient = useSelector((state: any) => state.patient);
  const auth = patient.internalId !== "";

  useEffect(() => {
    dispatch(
      setInitialState({
        plid: getPatientLinkIdFromUrl(),
      })
    );
  });

  return (
    <AppInsightsContext.Provider value={reactPlugin}>
      <PrimeErrorBoundary onError={(error: any) => <ErrorPage></ErrorPage>}>
        <div className="App">
          <div id="main-wrapper">
            <USAGovBanner />
            <PatientHeader />
            <PatientLinkURL404Wrapper plid={plid}>
              <Router basename={`${process.env.PUBLIC_URL}/pxp`}>
                <Switch>
                  <Route path="/" exact component={TermsOfService} />
                  <Route path="/terms-of-service" component={TermsOfService} />
                  <Route path="/birth-date-confirmation" component={DOB} />
                  <GuardedRoute
                    auth={auth}
                    path="/patient-info-confirm"
                    component={PatientProfileContainer}
                  />
                  <GuardedRoute
                    auth={auth}
                    path="/patient-info-edit"
                    component={PatientFormContainer}
                  />
                  <GuardedRoute
                    auth={auth}
                    path="/patient-info-symptoms"
                    component={AoEPatientFormContainer}
                  />
                  <GuardedRoute
                    auth={auth}
                    path="/success"
                    component={PatientLanding}
                  />
                  <GuardedRoute
                    auth={auth}
                    path="/test-result"
                    component={TestResult}
                  />
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
