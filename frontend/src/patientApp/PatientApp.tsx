import React, { useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import { ToastContainer } from "react-toastify";
import { useDispatch, connect } from "react-redux";
import "react-toastify/dist/ReactToastify.css";
import {
  Redirect,
  Route,
  Switch,
  BrowserRouter as Router,
} from "react-router-dom";
import { AppInsightsContext } from "@microsoft/applicationinsights-react-js";
import { reactPlugin } from "../app/AppInsights";

import PrimeErrorBoundary from "../app/PrimeErrorBoundary";
import USAGovBanner from "../app/commonComponents/USAGovBanner";
import { setInitialState } from "../app/store";
import { getPatientLinkIdFromUrl } from "../app/utils/url";
import ErrorPage from "./ErrorPage";
import PatientHeader from "./PatientHeader";
import TermsOfService from "./timeOfTest/TermsOfService";
import DOB from "./timeOfTest/DOB";
import AoEPatientFormContainer from "./timeOfTest/AoEPatientFormContainer";
import PatientLanding from "./timeOfTest/PatientLanding";
import PatientProfileContainer from "./timeOfTest/PatientProfileContainer";
import PatientProfileFormContainer from "./timeOfTest/PatientProfileFormContainer";

const PATIENT_LINK_QUERY = gql`
  query PatientLinkById($plid: String!) {
    patientLinkCurrent(internalId: $plid) {
      name
      testingFacility {
        id
        name
      }
    }
  }
`;

const PatientApp = () => {
  const dispatch = useDispatch();
  const plid = getPatientLinkIdFromUrl();
  if (plid == null) {
    throw new Error("Patient Link ID from URL was null");
  }

  const { data, loading, error } = useQuery(PATIENT_LINK_QUERY, {
    variables: { plid },
    fetchPolicy: "no-cache",
  });

  useEffect(() => {
    if (!data) return;

    dispatch(
      setInitialState({
        plid,
        organization: {
          name: data.patientLinkCurrent.name,
        },
        facilities: data.patientLinkCurrent.testingFacility,
        facility: data.patientLinkCurrent.testingFacility[0],
      })
    );
    // eslint-disable-next-line
  }, [data]);

  if (loading) {
    return <p>Loading account information...</p>;
  }

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
            {error ? (
              <ErrorPage error={error} />
            ) : (
              <Router basename={`${process.env.PUBLIC_URL}/pxp`}>
                <Switch>
                  <Route
                    path="/"
                    exact
                    render={({ location }) => (
                      <Redirect
                        to={{
                          ...location,
                          pathname: "/terms-of-service",
                        }}
                      />
                    )}
                  />
                  <Route path="/terms-of-service" component={TermsOfService} />
                  <Route path="/birth-date-confirmation" component={DOB} />
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
                      <PatientProfileFormContainer
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
            )}
            <ToastContainer
              autoClose={5000}
              closeButton={false}
              limit={2}
              position="bottom-center"
              hideProgressBar={true}
            />
          </div>
        </div>
      </PrimeErrorBoundary>
    </AppInsightsContext.Provider>
  );
};

export default connect()(PatientApp);
