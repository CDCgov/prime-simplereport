import React from "react";
import { gql, useQuery } from "@apollo/client";

import PatientForm from "./PatientForm";

const GET_PATIENT = gql`
  query GetPatientDetails($id: String!) {
    patient(id: $id) {
      lookupId
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
      testResults {
        internalId
        dateTested
        result
      }
    }
  }
`;

interface Props {
  facilityId: string;
  patientId: string;
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

  const residentCongregateSetting = data.patient.residentCongregateSetting
    ? "YES"
    : "NO";
  const employedInHealthcare = data.patient.employedInHealthcare ? "YES" : "NO";
  return (
    <PatientForm
      patient={{
        ...data.patient,
        residentCongregateSetting,
        employedInHealthcare,
      }}
      patientId={props.patientId}
      activeFacilityId={props.facilityId}
    />
  );
};

export default EditPatient;
