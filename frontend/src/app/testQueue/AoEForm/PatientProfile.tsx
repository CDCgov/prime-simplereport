import { displayFullName } from "../../utils";

interface Props {
  patient: any;
}

const PatientProfile = (props: Props) => {
  const fullName = displayFullName(
    props.patient.firstName,
    props.patient.middleName,
    props.patient.lastName
  );

  // props.patient.firstName,
  // props.patient.middleName,
  // props.patient.lastName,
  // props.patient.birthDate,
  // props.patient.street,
  // props.patient.streetTwo,
  // props.patient.city,
  // props.patient.state,
  // props.patient.zipCode,
  // props.patient.telephone,
  // props.patient.role,
  // props.patient.email,
  // props.patient.county,
  // props.patient.race,
  // props.patient.ethnicity,
  // props.patient.gender,
  // props.patient.residentCongregateSetting
  // props.patient.employedInHealthcare

  return (
    <div>
      {fullName}
    </div>

  );
};

export default PatientProfile;
