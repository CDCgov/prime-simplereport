import React from "react";
import { gql, useQuery } from "@apollo/client";

import PatientForm from "./PatientForm";

const GET_PATIENT = gql`
  query Patient($id: String!) {
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

const raceArrayToObject = (raceArray) => {
  const raceObject = {};
  raceArray.forEach(key => raceObject[key] = true);
  return raceObject;
}

const EditPatient = (props) => {
  const { data, loading, error } = useQuery(GET_PATIENT, {
    variables: { id: props.patientId || "" },
  });

  if (loading) {
    return <p>Loading...</p>;
  }
  if (error) {
    return <p>error loading patient with id {props.patientId}...</p>;
  }
  const birthDate = data.patient.birthDate
    ? `${data.patient.birthDate.split("-")[1]}/${
        data.patient.birthDate.split("-")[2]
      }/${data.patient.birthDate.split("-")[0]}`
    : data.patient.birthDate;

  const residentCongregateSetting = data.patient.residentCongregateSetting
    ? "YES"
    : "NO";
  const employedInHealthcare = data.patient.employedInHealthcare ? "YES" : "NO";

  const race = data.patient.race ? raceArrayToObject(data.patient.race) : data.patient.race

  return (
    <PatientForm
      patient={{
        ...data.patient,
        birthDate,
        residentCongregateSetting,
        employedInHealthcare,
        race
      }}
      patientId={props.patientId}
    />
  );
};

export default EditPatient;
