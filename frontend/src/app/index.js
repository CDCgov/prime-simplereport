import React from "react";
import Header from "./commonComponents/Header";
import Banner from "./commonComponents/Banner";
import OrganizationView from "./OrganizationView";
import LoginView from "./LoginView";
import NotFoundComponent from "./NotFoundView";
import Footer from "./commonComponents/Footer";

import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from "react-router-dom";

const isLoggedIn = true;

function App() {
  return (
    <div className="App">
      <div id="main-wrapper">
        <Banner />
        <Header />
        <Router>
          <Switch>
            <Route exact path="/">
              {!isLoggedIn ? <Redirect to="/login" /> : <OrganizationView />}
            </Route>
            <Route path="/login" component={LoginView} />
            <Route
              path="/organization/:organizationId"
              render={(props) => <OrganizationView {...props} />}
            />
            <Route component={NotFoundComponent} />
          </Switch>
        </Router>
        <Footer />
      </div>
    </div>
  );
}

export default App;
