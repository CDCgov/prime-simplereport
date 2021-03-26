import React from "react";
import { gql, useQuery } from "@apollo/client";

import PatientForm from "./PatientForm";

const GET_PATIENT = gql`
  query GetPatientDetails($id: ID!) {
    patient(id: $id) {
      firstName
      middleName
      lastName
      birthDate
      street
      streetTwo
      city
      state
      zipCode
      telephone
      role
      email
      county
      race
      ethnicity
      gender
      residentCongregateSetting
      employedInHealthcare
      facility {
        id
      }
    }
  }
`;

interface Props {
  facilityId: string;
  patientId: string;
}

function translateBoolToYesNoUnk(bool: string | null) {
  if (bool === "true") {
    return "YES";
  } else if (bool === "false") {
    return "NO";
  }
  else {
    return "UNKNOWN";
  }
}

const EditPatient = (props: Props) => {
  const { data, loading, error } = useQuery(GET_PATIENT, {
    variables: { id: props.patientId || "" },
    fetchPolicy: "no-cache",
  });

  if (loading) {
    return <p>Loading...</p>;
  }
  if (error) {
    return <p>error loading patient with id {props.patientId}...</p>;
  }

  const residentCongregateSetting = translateBoolToYesNoUnk(data.patient.residentCongregateSetting);
  const employedInHealthcare = translateBoolToYesNoUnk(data.patient.employedInHealthcare);

  return (
    <div className="bg-base-lightest">
      <div className="grid-container">
        <PatientForm
          patient={{
            ...data.patient,
            residentCongregateSetting,
            employedInHealthcare,
          }}
          patientId={props.patientId}
          activeFacilityId={props.facilityId}
          isPxpView={false}
        />
      </div>
    </div>
  );
};

export default EditPatient;
