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

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      organizationId: 123, // TODO: don't hardcode this
    };
  }

  render() {
    return (
      <div className="App">
        <div id="main-wrapper">
          <Banner />
          <Header />
          <Router>
            <Switch>
              <Route exact path="/">
                {!isLoggedIn ? (
                  <Redirect to="/login" />
                ) : (
                  <Redirect to={`/organization/${this.state.organizationId}`} /> // TODO get the orgId from the initial request
                )}
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
}

export default App;
