import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import OrganizationHome from "./OrganizationHome";
import TestResultView from "../TestResultView";
import { getTestRegistrations } from "../../query/tests";

class OrganizationHomeContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      testRegistrations: [],
    };
  }

  componentDidMount = async () => {
    try {
      let organizationId = this.props.match.params.organizationId;
      const testRegistrations = await getTestRegistrations(organizationId);
      this.setState({
        ...this.state,
        testRegistrations,
      });
    } catch (err) {
      console.log("Error: ", err);
    }
  };

  render() {
    return (
      <React.Fragment>
        <Router>
          <Switch>
            <Route
              exact
              path="/organization/:organizationId/"
              render={(props) => (
                <OrganizationHome
                  testRegistrations={this.state.testRegistrations}
                />
              )}
            />
            <Route
              path="/organization/:organizationId/testResult/:testRegistrationId"
              render={(props) => <TestResultView {...props} />}
            />
          </Switch>
        </Router>
      </React.Fragment>
    );
  }
}

export default OrganizationHomeContainer;
