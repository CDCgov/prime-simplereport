import React, { useState } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { toast } from "react-toastify";
import { Redirect } from "react-router-dom";

import iconSprite from "../../../node_modules/uswds/dist/img/sprite.svg";
import { PATIENT_TERM_CAP } from "../../config/constants";
import { displayFullName, showNotification } from "../utils";
import Alert from "../commonComponents/Alert";
import Button from "../commonComponents/Button/Button";
import { LinkWithQuery } from "../commonComponents/LinkWithQuery";

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
      lookupId
      email
      county
      race
      ethnicity
      tribalAffiliation
      gender
      residentCongregateSetting
      employedInHealthcare
      preferredLanguage
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
    $lookupId: String
    $email: String
    $county: String
    $race: String
    $ethnicity: String
    $tribalAffiliation: String
    $gender: String
    $residentCongregateSetting: Boolean
    $employedInHealthcare: Boolean
    $preferredLanguage: String
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
      lookupId: $lookupId
      email: $email
      county: $county
      race: $race
      ethnicity: $ethnicity
      tribalAffiliation: $tribalAffiliation
      gender: $gender
      residentCongregateSetting: $residentCongregateSetting
      employedInHealthcare: $employedInHealthcare
      preferredLanguage: $preferredLanguage
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
  const [updatePatient, { loading: editPersonLoading }] = useMutation<
    EditPatientResponse,
    EditPatientParams
  >(UPDATE_PATIENT);
  const [redirect, setRedirect] = useState<string | undefined>(undefined);
  const personPath = `/patients/?facility=${props.facilityId}`;

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

    setRedirect(personPath);
  };

  const getTitle = (person: Nullable<PersonFormData>) =>
    displayFullName(person.firstName, person.middleName, person.lastName);

  return (
    <div className="bg-base-lightest">
      <div className="grid-container">
        <main className={"prime-edit-patient prime-home"}>
          <div className={"margin-bottom-4"}>
            <PersonForm
              patient={{
                ...data.patient,
                facilityId:
                  data.patient.facility === null
                    ? null
                    : data.patient.facility?.id,
              }}
              patientId={props.patientId}
              activeFacilityId={props.facilityId}
              savePerson={savePerson}
              getHeader={(person, onSave, formChanged) => (
                <div className="display-flex flex-justify">
                  <div>
                    <div className="display-flex flex-align-center">
                      <svg
                        className="usa-icon text-base margin-left-neg-2px"
                        aria-hidden="true"
                        focusable="false"
                        role="img"
                      >
                        <use xlinkHref={iconSprite + "#arrow_back"}></use>
                      </svg>
                      <LinkWithQuery
                        to={`/patients`}
                        className="margin-left-05"
                      >
                        People
                      </LinkWithQuery>
                    </div>
                    <div className="prime-edit-patient-heading margin-y-0">
                      <h1 className="font-heading-lg margin-top-1 margin-bottom-0">
                        {getTitle(person)}
                      </h1>
                    </div>
                  </div>
                  <div className="display-flex flex-align-center">
                    <button
                      className="prime-save-patient-changes usa-button margin-right-0"
                      disabled={editPersonLoading || !formChanged}
                      onClick={onSave}
                    >
                      {editPersonLoading ? "Saving..." : "Save changes"}
                    </button>
                  </div>
                </div>
              )}
              getFooter={(onSave, formChanged) => (
                <div className="prime-edit-patient-heading">
                  <Button
                    id="edit-patient-save-lower"
                    className="prime-save-patient-changes"
                    disabled={editPersonLoading || !formChanged}
                    onClick={onSave}
                    label={editPersonLoading ? "Saving..." : "Save changes"}
                  />
                </div>
              )}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default EditPatient;
