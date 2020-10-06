import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { connect } from "react-redux";

import OrganizationHome from "./OrganizationHome";
import TestResultView from "../TestResultView";
import { loadTestRegistrations } from "../actions/addTestRegistration";

class OrganizationHomeContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount = async () => {
    try {
      let organizationId = this.props.match.params.organizationId;
      this.props.loadTestRegistrations(organizationId);
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
                  testRegistrations={this.props.testRegistrations}
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

const mapStateToProps = (state) => {
  return {
    testRegistrations: state.testRegistrations,
  };
};

const mapDispatchToProps = (dispatch) => ({
  loadTestRegistrations: (organizationId) =>
    dispatch(loadTestRegistrations(organizationId)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OrganizationHomeContainer);
