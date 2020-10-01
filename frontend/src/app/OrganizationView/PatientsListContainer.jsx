import React from "react";
import { getPatients } from "../../query/patients";
import PatientsList from "./PatientsList";

class PatientsListContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      patients: [],
    };
  }

  componentDidMount = async () => {
    try {
      // var orgId = this.props.match.params.organizationId;
      const patients = await getPatients();
      this.setState({
        ...this.state,
        patients,
      });
    } catch (err) {
      console.log("Error: ", err);
    }
  };

  render() {
    console.log(this.props);
    return <PatientsList patients={this.state.patients} />;
  }
}

export default PatientsListContainer;
