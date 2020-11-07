import React, { useState } from "react";
import Header from "./commonComponents/Header";
import USAGovBanner from "./commonComponents/USAGovBanner";
import OrganizationHomeContainer from "./OrganizationView/OrganizationHomeContainer";
import LoginView from "./LoginView";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
//import Footer from "./commonComponents/Footer";
import ProtectedRoute from "./commonComponents/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from "react-router-dom";
const isAuthenticated = true;

const App = () => {
  const [organization] = useState({ id: "123" });

  return (
    <div className="App">
      <div id="main-wrapper">
        <USAGovBanner />
        <Router>
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
          position="bottom-center"
          autoClose={5000}
          closeButton={false}
          hideProgressBar={true}
          limit={1}
          containerId={"toastContainerId"}
        />
        {/* <Footer /> */}
      </div>
    </div>
  );
};

export default App;
