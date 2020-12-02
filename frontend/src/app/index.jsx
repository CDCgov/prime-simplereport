import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from "react-router-dom";
import { AppInsightsContext } from "@microsoft/applicationinsights-react-js";
import { reactPlugin } from "./AppInsights";

import PrimeErrorBoundary from "./PrimeErrorBoundary";
import Header from "./commonComponents/Header";
import USAGovBanner from "./commonComponents/USAGovBanner";
import OrganizationHomeContainer from "./OrganizationView/OrganizationHomeContainer";
import LoginView from "./LoginView";
//import Footer from "./commonComponents/Footer";
import ProtectedRoute from "./commonComponents/ProtectedRoute";
const isAuthenticated = true;

const App = () => {
  const [organization] = useState({ id: "123" });

  return (
    <AppInsightsContext.Provider value={reactPlugin}>
      <PrimeErrorBoundary
        onError={(error) => (
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
              <Header organizationId={organization.id} />
              <Switch>
                <Route path="/login" component={LoginView} />
                <ProtectedRoute
                  path="/organization/:organizationId"
                  component={OrganizationHomeContainer}
                  isAuthenticated={isAuthenticated}
                />
                <Route path="/">
                  <Redirect to={`/organization/${organization.id}`} />
                </Route>
                {/* <Route component={NotFoundComponent} /> */}
              </Switch>
            </Router>
            <ToastContainer
              autoClose={5000}
              closeButton={false}
              limit={1}
              position="bottom-center"
              hideProgressBar={true}
            />
            {/* <Footer /> */}
          </div>
        </div>
      </PrimeErrorBoundary>
    </AppInsightsContext.Provider>
  );
};

export default App;
