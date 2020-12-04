import React, { useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import { ToastContainer } from "react-toastify";
import { useDispatch } from "react-redux";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { AppInsightsContext } from "@microsoft/applicationinsights-react-js";
import { reactPlugin } from "./AppInsights";

import PrimeErrorBoundary from "./PrimeErrorBoundary";
import Header from "./commonComponents/Header";
import USAGovBanner from "./commonComponents/USAGovBanner";
import OrganizationHomeContainer from "./OrganizationView/OrganizationHomeContainer";
import LoginView from "./LoginView";
import { setInitialState } from "./store";

const WHOAMI_QUERY = gql`
  {
    whoami {
      id
      firstName
      middleName
      lastName
      suffix
      organization {
        testingFacility {
          id
          name
        }
      }
    }
  }
`;

const App = () => {
  // const dispatch = useDispatch();
  const { data, loading, error } = useQuery(WHOAMI_QUERY, {
    fetchPolicy: "no-cache",
  });
  useEffect(() => {
    if (!data) return;
    // dispatch(
    //   setInitialState({
    //     facilities: data.whoami.organization.testingFacility,
    //     facility: data.whoami.organization.testingFacility[0],
    //     user: {
    //       id: data.whoami.id,
    //       firstName: data.whoami.firstName,
    //       middleName: data.whoami.middleName,
    //       lastName: data.whoami.lastName,
    //       suffix: data.whoami.suffix,
    //     },
    //   })
    // );
    // eslint-disable-next-line
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
                <Route path="/" component={OrganizationHomeContainer} />
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

export default App;
