import React, { useState } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Redirect } from "react-router-dom";
import { useTranslation } from "react-i18next";

import iconSprite from "../../../node_modules/uswds/dist/img/sprite.svg";
import { PATIENT_TERM_CAP } from "../../config/constants";
import { displayFullName, showNotification } from "../utils";
import Alert from "../commonComponents/Alert";
import Button from "../commonComponents/Button/Button";
import { LinkWithQuery } from "../commonComponents/LinkWithQuery";
import { useDocumentTitle } from "../utils/hooks";

import { TestResultDeliveryPreference } from "./TestResultDeliveryPreference";
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
      phoneNumbers {
        type
        number
      }
      role
      lookupId
      email
      emails
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
      testResultDelivery
    }
  }
`;

interface GetPatientParams {
  id: string;
}

interface GetPatientResponse {
  patient: {
    firstName: string;
    middleName: string | null;
    lastName: string;
    birthDate: string;
    street: string;
    streetTwo: string | null;
    city: string | null;
    state: string;
    zipCode: string;
    telephone: string;
    phoneNumbers: PhoneNumber[];
    role: Role | null;
    lookupId: string | null;
    email: string | null;
    emails: string[];
    county: string | null;
    race: Race | null;
    ethnicity: Ethnicity | null;
    tribalAffiliation: (TribalAffiliation | null)[] | null;
    gender: Gender | null;
    residentCongregateSetting: boolean | null;
    employedInHealthcare: boolean | null;
    preferredLanguage: Language | null;
    facility: {
      id: string;
    } | null;
    testResultDelivery: TestResultDeliveryPreference | null;
  };
}

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
    $telephone: String
    $phoneNumbers: [PhoneNumberInput!]
    $role: String
    $lookupId: String
    $email: String
    $emails: [String]
    $county: String
    $race: String
    $ethnicity: String
    $tribalAffiliation: String
    $gender: String
    $residentCongregateSetting: Boolean
    $employedInHealthcare: Boolean
    $preferredLanguage: String
    $testResultDelivery: TestResultDeliveryPreference
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
      phoneNumbers: $phoneNumbers
      role: $role
      lookupId: $lookupId
      email: $email
      emails: $emails
      county: $county
      race: $race
      ethnicity: $ethnicity
      tribalAffiliation: $tribalAffiliation
      gender: $gender
      residentCongregateSetting: $residentCongregateSetting
      employedInHealthcare: $employedInHealthcare
      preferredLanguage: $preferredLanguage
      testResultDelivery: $testResultDelivery
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
  useDocumentTitle("Edit Patient");

  const { t } = useTranslation();

  const { data, loading, error } = useQuery<
    GetPatientResponse,
    GetPatientParams
  >(GET_PATIENT, {
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
  if (error || data === undefined) {
    return <p>error loading patient with id {props.patientId}...</p>;
  }

  const savePerson = async (person: Nullable<PersonFormData>) => {
    await updatePatient({
      variables: {
        patientId: props.patientId,
        ...person,
        phoneNumbers: (person.phoneNumbers || [])
          .filter(function removeEmptyPhoneNumbers(phoneNumber: PhoneNumber) {
            return phoneNumber && phoneNumber.number && phoneNumber.type;
          })
          .map(function removeTypename(phoneNumber: PhoneNumber) {
            // GraphQL query returns a `__typename` meta field on
            // `PhoneNumber` objects which must be removed before they
            // may be used in a mutation
            return {
              number: phoneNumber.number,
              type: phoneNumber.type,
            };
          }),
      },
    });
    showNotification(
      <Alert
        type="success"
        title={`${PATIENT_TERM_CAP} record saved`}
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
                tribalAffiliation:
                  data.patient.tribalAffiliation?.[0] || undefined,
                phoneNumbers: data.patient.phoneNumbers.sort(function (
                  x: PhoneNumber,
                  y: PhoneNumber
                ) {
                  // A patient's primary phone number is returned in the
                  // query as `telephone` and should be the first element
                  // of the array of phone numbers
                  return x.number === data.patient.telephone
                    ? -1
                    : y.number === data.patient.telephone
                    ? 1
                    : 0;
                }),
                facilityId:
                  data.patient.facility === null
                    ? null
                    : data.patient.facility?.id,
              }}
              patientId={props.patientId}
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
                      {editPersonLoading
                        ? `${t("common.button.saving")}...`
                        : t("common.button.save")}
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
                    label={
                      editPersonLoading
                        ? `${t("common.button.saving")}...`
                        : t("common.button.save")
                    }
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
