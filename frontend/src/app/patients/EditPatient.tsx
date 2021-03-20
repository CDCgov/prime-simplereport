import React, { useState } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { toast } from "react-toastify";
import { Redirect } from "react-router-dom";

import { PATIENT_TERM_CAP } from "../../config/constants";
import { showNotification } from "../utils";
import Alert from "../commonComponents/Alert";

import PersonForm from "./Components/PersonForm";

export const GET_PATIENT = gql`
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

const UPDATE_PATIENT = gql`
  mutation UpdatePatient(
    $facilityId: ID
    $patientId: ID!
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
    updatePatient(
      facilityId: $facilityId
      patientId: $patientId
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

interface Props {
  facilityId: string;
  patientId: string;
}

interface EditPatientParams extends Nullable<Omit<PersonFormData, "lookupId">> {
  patientId: string;
}

interface EditPatientResponse {
  internalId: string;
}

const EditPatient = (props: Props) => {
  const { data, loading, error } = useQuery(GET_PATIENT, {
    variables: { id: props.patientId || "" },
    fetchPolicy: "no-cache",
  });
  const [updatePatient] = useMutation<EditPatientResponse, EditPatientParams>(
    UPDATE_PATIENT
  );
  const [redirect, setRedirect] = useState<string | undefined>(undefined);

  if (redirect) {
    return <Redirect to={redirect} />;
  }

  if (loading) {
    return <p>Loading...</p>;
  }
  if (error) {
    return <p>error loading patient with id {props.patientId}...</p>;
  }

  const savePerson = async (person: Nullable<PersonFormData>) => {
    await updatePatient({
      variables: {
        patientId: props.patientId,
        ...person,
      },
    });
    showNotification(
      toast,
      <Alert
        type="success"
        title={`${PATIENT_TERM_CAP} Record Saved`}
        body="Information record has been updated."
      />
    );

    setRedirect(`/patients/?facility=${props.facilityId}`);
  };

  return (
    <div className="bg-base-lightest">
      <div className="grid-container">
        <PersonForm
          patient={{
            ...data.patient,
            facilityId:
              data.patient.facility === null ? null : data.patient.facility?.id,
          }}
          patientId={props.patientId}
          activeFacilityId={props.facilityId}
          isPxpView={false}
          savePerson={savePerson}
        />
      </div>
    </div>
  );
};

export default EditPatient;
