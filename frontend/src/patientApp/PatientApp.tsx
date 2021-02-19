import React, { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { useDispatch, connect } from "react-redux";
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
import { showError } from "../app/utils";
import { PxpApi } from "./PxpApiService";

const PatientApp = () => {
  const dispatch = useDispatch();
  const plid = getPatientLinkIdFromUrl();
  if (plid == null) {
    throw new Error("Patient Link ID from URL was null");
  }

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    PxpApi.getOrgFromPlid(plid)
      .then((data: any) => {
        dispatch(
          setInitialState({
            plid,
            organization: {
              name: data.organizationName,
            },
          })
        );
      })
      .catch((err) => showError(err))
      .finally(() => {
        setLoading(false);
      });
  }, [dispatch, plid]);

  if (loading) {
    return (
      <main>
        <div className="grid-container maxw-tablet">
          <p className="margin-top-3">Loading account information...</p>
        </div>
        <ToastContainer
          autoClose={5000}
          closeButton={false}
          limit={2}
          position="bottom-center"
          hideProgressBar={true}
        />
      </main>
    );
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
            <Router basename={`${process.env.PUBLIC_URL}/pxp`}>
              <Switch>
                <Route
                  path="/"
                  exact
                  render={(props) => <DOB {...(props.location.state as any)} />}
                />
                <Route
                  path="/birth-date-confirmation"
                  render={(props) => <DOB {...(props.location.state as any)} />}
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
                    <PatientFormContainer {...(props.location.state as any)} />
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
          </div>
        </div>
      </PrimeErrorBoundary>
    </AppInsightsContext.Provider>
  );
};

export default connect()(PatientApp);
