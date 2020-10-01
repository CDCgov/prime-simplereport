import React from "react";
import PatientManagementNav from "./PatientManagementNav";
import PropTypes from "prop-types";
import uniqueId from "react-html-id";

class PatientsList extends React.Component {
  constructor() {
    super();
    uniqueId.enableUniqueIds(this);
  }
  static propTypes = {
    patients: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        dateOfBirth: PropTypes.string,
        address: PropTypes.string,
        phone: PropTypes.string,
      })
    ),
  };

  render() {
    let rows = this.props.patients.map((patient) => (
      <tr key={`patient-${this.nextUniqueId()}`}>
        <th scope="row">{patient.name}</th>
        <td>{patient.dateOfBirth}</td>
        <td>{patient.address}</td>
        <td>{patient.phone}</td>
      </tr>
    ));

    return (
      <React.Fragment>
        <PatientManagementNav />

        <main className="prime-home">
          <div className="grid-container">
            <div className="grid-row">
              <div className="prime-container">
                <h2> Scheduled Today </h2>

                <table className="usa-table usa-table--borderless">
                  <thead>
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Date of Birth</th>
                      <th scope="col">Address</th>
                      <th scope="col">Phone Number</th>
                    </tr>
                  </thead>
                  <tbody>{rows}</tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </React.Fragment>
    );
  }
}

export default PatientsList;
