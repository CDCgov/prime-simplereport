import React from "react";
import PropTypes from "prop-types";
import uniqueId from "react-html-id";

import TestRegistrationManagementNav from "./TestRegistration/TestRegistrationManagementNav";
import TestRegistrationList from "./TestRegistration/TestRegistrationList";
import { testRegistrationPropType } from "../propTypes";

class OrganizationHome extends React.Component {
  constructor() {
    super();
    uniqueId.enableUniqueIds(this);
  }
  static propTypes = {
    testRegistrations: PropTypes.arrayOf(testRegistrationPropType),
  };

  render() {
    return (
      <React.Fragment>
        <TestRegistrationManagementNav />

        <main className="prime-home">
          <div className="grid-container">
            <div className="grid-row">
              <TestRegistrationList
                testRegistrations={this.props.testRegistrations}
              />
            </div>
          </div>
        </main>
      </React.Fragment>
    );
  }
}

export default OrganizationHome;
