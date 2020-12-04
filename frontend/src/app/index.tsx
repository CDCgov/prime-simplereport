import React, { useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import { ToastContainer } from "react-toastify";
import { useDispatch, connect } from "react-redux";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { AppInsightsContext } from "@microsoft/applicationinsights-react-js";
import { reactPlugin } from "./AppInsights";

import PrimeErrorBoundary from "./PrimeErrorBoundary";
import Header from "./commonComponents/Header";
import USAGovBanner from "./commonComponents/USAGovBanner";
import LoginView from "./LoginView";
import { setInitialState } from "./store";
import TestResultsList from "./testResults/TestResultsList";
import TestQueue from "./testQueue/TestQueue";
import ManagePatients from "./patients/ManagePatients";
import EditPatient from "./patients/EditPatient";
import AddPatient from "./patients/AddPatient";
import Settings from "./Settings/Settings";

const WHOAMI_QUERY = gql`
  {
    whoami {
      id
      firstName
      middleName
      lastName
      suffix
      organization {
        name
        testingFacility {
          id
          name
        }
      }
    }
  }
`;

// typescript doesn't like that these components throw errors
const Results = TestResultsList as any;

const App = () => {
  const dispatch = useDispatch();
  const { data, loading, error } = useQuery(WHOAMI_QUERY, {
    fetchPolicy: "no-cache",
  });
  useEffect(() => {
    if (!data) return;
    dispatch(
      setInitialState({
        organization: {
          name: data.whoami.organization.name,
        },
        facilities: data.whoami.organization.testingFacility,
        facility: data.whoami.organization.testingFacility[0],
        user: {
          id: data.whoami.id,
          firstName: data.whoami.firstName,
          middleName: data.whoami.middleName,
          lastName: data.whoami.lastName,
          suffix: data.whoami.suffix,
        },
      })
    );
  }, [data]);

  if (loading) {
    return <p>Loading account information...</p>;
  }

  if (error) {
    throw error;
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
            <Router basename={process.env.PUBLIC_URL}>
              <Header />
              <Switch>
                <Route path="/login" component={LoginView} />
                <Route
                  path="/queue"
                  render={() => {
                    return <TestQueue />;
                  }}
                />
                <Route
                  path="/results"
                  render={() => {
                    return <Results />;
                  }}
                />
                <Route
                  path={`/patients`}
                  render={() => {
                    return <ManagePatients />;
                  }}
                />
                <Route
                  path={`/patient/:patientId`}
                  render={({ match }) => (
                    <EditPatient patientId={match.params.patientId} />
                  )}
                />
                <Route path={`/add-patient/`} render={() => <AddPatient />} />
                <Route
                  path={`/settings`}
                  render={() => {
                    return <Settings />;
                  }}
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
          </div>
        </div>
      </PrimeErrorBoundary>
    </AppInsightsContext.Provider>
  );
};

export default connect()(App);
