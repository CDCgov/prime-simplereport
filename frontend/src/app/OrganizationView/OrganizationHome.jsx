import React from "react";
import PropTypes from "prop-types";

import TestRegistrationManagementNav from "./TestRegistration/TestRegistrationManagementNav";
import TestRegistrationList from "./TestRegistration/TestRegistrationList";
import { testRegistrationPropType } from "../propTypes";

const OrganizationHome = ({ testRegistrations }) => (
  <React.Fragment>
    <TestRegistrationManagementNav />

    <main className="prime-home">
      <div className="grid-container">
        <div className="grid-row">
          <TestRegistrationList testRegistrations={testRegistrations} />
        </div>
      </div>
    </main>
  </React.Fragment>
);

OrganizationHome.propTypes = {
  testRegistrations: PropTypes.arrayOf(testRegistrationPropType),
};

export default OrganizationHome;
