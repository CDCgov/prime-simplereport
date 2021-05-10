import React, { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import { Redirect } from "react-router-dom";
import { useSelector } from "react-redux";

import iconSprite from "../../../node_modules/uswds/dist/img/sprite.svg";
import { PATIENT_TERM_CAP } from "../../config/constants";
import { showNotification } from "../utils";
import Alert from "../commonComponents/Alert";
import Button from "../commonComponents/Button/Button";
import { RootState } from "../store";
import { LinkWithQuery } from "../commonComponents/LinkWithQuery";

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

type AddPatientParams = Nullable<Omit<PersonFormData, "lookupId">>;

interface AddPatientResponse {
  internalId: string;
}

const AddPatient = () => {
  const [addPatient, { loading }] = useMutation<
    AddPatientResponse,
    AddPatientParams
  >(ADD_PATIENT);
  const activeFacilityId: string = useSelector<RootState, string>(
    (state) => state.facility.id
  );
  const personPath = `/patients/?facility=${activeFacilityId}`;
  const [redirect, setRedirect] = useState<string | undefined>(undefined);

  if (redirect) {
    return <Redirect to={redirect} />;
  }

  if (activeFacilityId.length < 1) {
    return <div>No facility selected</div>;
  }

  const savePerson = async (person: Nullable<PersonFormData>) => {
    await addPatient({ variables: { ...person } });
    showNotification(
      toast,
      <Alert
        type="success"
        title={`${PATIENT_TERM_CAP} Record Created`}
        body="New information record has been created."
      />
    );
    setRedirect(personPath);
  };

  return (
    <main className={"prime-edit-patient prime-home"}>
      <div className={"grid-container margin-bottom-4"}>
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
            residentCongregateSetting: undefined,
            employedInHealthcare: undefined,
            tribalAffiliation: null,
            birthDate: null,
            telephone: null,
            county: null,
            email: null,
            street: null,
            streetTwo: null,
            city: null,
            state: null,
            zipCode: null,
            preferredLanguage: null,
          }}
          activeFacilityId={activeFacilityId}
          savePerson={savePerson}
          getHeader={(_, onSave, formChanged) => (
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
                  <LinkWithQuery to={`/patients`} className="margin-left-05">
                    People
                  </LinkWithQuery>
                </div>
                <div className="prime-edit-patient-heading margin-y-0">
                  <h1 className="font-heading-lg margin-top-1 margin-bottom-0">
                    Add New {PATIENT_TERM_CAP}
                  </h1>
                </div>
              </div>
              <div className="display-flex flex-align-center">
                <button
                  className="prime-save-patient-changes usa-button margin-right-0 "
                  disabled={loading || !formChanged}
                  onClick={onSave}
                >
                  {loading ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>
          )}
          getFooter={(onSave, formChanged) => (
            <div className="prime-edit-patient-heading">
              <Button
                id="edit-patient-save-lower"
                className="prime-save-patient-changes"
                disabled={loading || !formChanged}
                onClick={onSave}
                label={loading ? "Saving..." : "Save changes"}
              />
            </div>
          )}
        />
      </div>
    </main>
  );
};

export default AddPatient;
