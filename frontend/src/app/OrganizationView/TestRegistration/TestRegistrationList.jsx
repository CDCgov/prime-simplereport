import React from "react";
import PropTypes from "prop-types";
import { Link, withRouter } from "react-router-dom";
import uniqueId from "react-html-id";
import { displayFullName } from "../../helpers";

import { testRegistrationPropType } from "../../propTypes";

class TestRegistrationList extends React.Component {
  constructor() {
    super();
    uniqueId.enableUniqueIds(this);
  }

  static propTypes = {
    testRegistrations: PropTypes.arrayOf(testRegistrationPropType),
  };

  testRegistrationRows = (testRegistrations) => {
    const { url } = this.props.match;
    let rows = testRegistrations.map((testRegistration) => (
      <tr key={`testRegistration-${this.nextUniqueId()}`}>
        <th scope="row">
          {displayFullName(
            testRegistration.firstName,
            testRegistration.middleName,
            testRegistration.lastName
          )}
        </th>
        <td>{testRegistration.birthDate}</td>
        <td>{testRegistration.address}</td>
        <td>{testRegistration.phone}</td>
        <td>
          <Link to={`${url}/testResult/${testRegistration.testRegistrationId}`}>
            View Results
          </Link>
        </td>
      </tr>
    ));
    return rows;
  };

  render() {
    let rows = this.testRegistrationRows(this.props.testRegistrations);

    return (
      <div className="prime-container">
        <h2> Scheduled Today </h2>

        <table className="usa-table usa-table--borderless">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Date of Birth</th>
              <th scope="col">Address</th>
              <th scope="col">Phone Number</th>
              <th scope="col">Test Results</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>
    );
  }
}

export default withRouter(TestRegistrationList);
