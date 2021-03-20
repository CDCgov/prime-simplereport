import React, { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import { Redirect } from "react-router-dom";
import { useSelector } from "react-redux";

import { PATIENT_TERM_CAP } from "../../config/constants";
import { showNotification } from "../utils";
import Alert from "../commonComponents/Alert";

import PersonForm from "./Components/PersonForm";

export const ADD_PATIENT = gql`
  mutation AddPatient(
    $facilityId: ID
    $firstName: String!
    $middleName: String
    $lastName: String!
    $birthDate: LocalDate!
    $street: String!
    $streetTwo: String
    $city: String
    $state: String!
    $zipCode: String!
    $telephone: String!
    $role: String
    $email: String
    $county: String
    $race: String
    $ethnicity: String
    $gender: String
    $residentCongregateSetting: Boolean!
    $employedInHealthcare: Boolean!
  ) {
    addPatient(
      facilityId: $facilityId
      firstName: $firstName
      middleName: $middleName
      lastName: $lastName
      birthDate: $birthDate
      street: $street
      streetTwo: $streetTwo
      city: $city
      state: $state
      zipCode: $zipCode
      telephone: $telephone
      role: $role
      email: $email
      county: $county
      race: $race
      ethnicity: $ethnicity
      gender: $gender
      residentCongregateSetting: $residentCongregateSetting
      employedInHealthcare: $employedInHealthcare
    ) {
      internalId
    }
  }
`;

interface AddPatientParams
  extends Nullable<
    Omit<
      PersonFormData,
      "residentCongregateSetting" | "employedInHealthcare" | "lookupId"
    >
  > {
  residentCongregateSetting: boolean;
  employedInHealthcare: boolean;
}

interface AddPatientResponse {
  internalId: string;
}

const AddPatient = () => {
  const [addPatient] = useMutation<AddPatientResponse, AddPatientParams>(
    ADD_PATIENT
  );
  const activeFacilityId: string = useSelector(
    (state) => (state as any).facility.id
  );
  const [redirect, setRedirect] = useState<string | undefined>(undefined);

  if (redirect) {
    return <Redirect to={redirect} />;
  }

  if (activeFacilityId.length < 1) {
    return <div>No facility selected</div>;
  }

  const savePerson = async (person: Nullable<PersonFormData>) => {
    const variables = {
      ...person,
      residentCongregateSetting: person.residentCongregateSetting === "YES",
      employedInHealthcare: person.employedInHealthcare === "YES",
    };
    await addPatient({ variables });
    showNotification(
      toast,
      <Alert
        type="success"
        title={`${PATIENT_TERM_CAP} Record Created`}
        body="New information record has been created."
      />
    );
    setRedirect(`/patients/?facility=${activeFacilityId}`);
  };

  return (
    <PersonForm
      patient={{
        facilityId: "",
        firstName: null,
        middleName: null,
        lastName: null,
        lookupId: null,
        role: null,
        race: null,
        ethnicity: null,
        gender: null,
        residentCongregateSetting: null,
        employedInHealthcare: null,
        birthDate: null,
        telephone: null,
        county: null,
        email: null,
        street: null,
        streetTwo: null,
        city: null,
        state: null,
        zipCode: null,
      }}
      activeFacilityId={activeFacilityId}
      isPxpView={false}
      savePerson={savePerson}
    />
  );
};

export default AddPatient;
