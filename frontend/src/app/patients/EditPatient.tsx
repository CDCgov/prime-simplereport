import React, { useState } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { NavigateOptions, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import iconSprite from "../../../node_modules/@uswds/uswds/dist/img/sprite.svg";
import {
  PATIENT_TERM_CAP,
  PATIENT_TERM_PLURAL_CAP,
} from "../../config/constants";
import { displayFullName, dedupeAndCompactStrings } from "../utils";
import { showSuccess } from "../utils/srToast";
import Button from "../commonComponents/Button/Button";
import { LinkWithQuery } from "../commonComponents/LinkWithQuery";
import { useDocumentTitle } from "../utils/hooks";
import { StartTestProps } from "../testQueue/addToQueue/AddToQueueSearch";
import { useSelectedFacility } from "../facilitySelect/useSelectedFacility";

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
      country
      race
      ethnicity
      tribalAffiliation
      gender
      genderIdentity
      residentCongregateSetting
      employedInHealthcare
      preferredLanguage
      facility {
        id
      }
      testResultDelivery
      notes
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
    city: string;
    state: string;
    zipCode: string;
    telephone: string;
    phoneNumbers: PhoneNumber[];
    role: Role | null;
    lookupId: string | null;
    emails: string[];
    county: string | null;
    country: string | null;
    race: Race | null;
    ethnicity: Ethnicity | null;
    tribalAffiliation: (TribalAffiliation | null)[] | null;
    gender: Gender | null;
    genderIdentity: GenderIdentity | null;
    residentCongregateSetting: boolean | null;
    employedInHealthcare: boolean | null;
    preferredLanguage: Language | null;
    facility: {
      id: string;
    } | null;
    testResultDelivery: TestResultDeliveryPreference | null;
    notes: string | null;
  };
}

export const UPDATE_PATIENT = gql`
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
    $emails: [String]
    $county: String
    $country: String
    $race: String
    $ethnicity: String
    $tribalAffiliation: String
    $gender: String
    $genderIdentity: String
    $residentCongregateSetting: Boolean
    $employedInHealthcare: Boolean
    $preferredLanguage: String
    $testResultDelivery: TestResultDeliveryPreference
    $notes: String
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
      emails: $emails
      county: $county
      country: $country
      race: $race
      ethnicity: $ethnicity
      tribalAffiliation: $tribalAffiliation
      gender: $gender
      genderIdentity: $genderIdentity
      residentCongregateSetting: $residentCongregateSetting
      employedInHealthcare: $employedInHealthcare
      preferredLanguage: $preferredLanguage
      testResultDelivery: $testResultDelivery
      notes: $notes
    ) {
      internalId
    }
  }
`;

interface Props {
  facilityId: string;
  patientId: string;
  fromQueue?: boolean;
}

interface EditPatientParams extends Nullable<Omit<PersonFormData, "lookupId">> {
  patientId: string;
}

interface EditPatientResponse {
  internalId: string;
}

interface RedirectSettings {
  pathname: string;
  search: string;
  state?: any;
}

const EditPatient = (props: Props) => {
  useDocumentTitle("Edit patient");

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
  const navigate = useNavigate();
  const [activeFacility] = useSelectedFacility();
  const activeFacilityId = activeFacility?.id;
  const [redirect, setRedirect] = useState<
    string | RedirectSettings | undefined
  >(undefined);
  const personPath = `/patients/?facility=${props.facilityId}`;

  if (redirect) {
    const redirectTo =
      typeof redirect === "string"
        ? redirect
        : redirect.pathname + redirect.search;

    const navOptions: NavigateOptions = {};

    if (typeof redirect !== "string") {
      navOptions.state = redirect.state;
    }

    navigate(redirectTo, navOptions);
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
        emails: dedupeAndCompactStrings(person.emails || []),
      },
    });
    showSuccess(
      "Information record has been updated.",
      `${PATIENT_TERM_CAP} record saved`
    );
  };

  const beginTest = (startTest: boolean) => {
    if (startTest) {
      const facility = data?.patient.facility?.id || activeFacilityId;
      setRedirect({
        pathname: "/queue",
        search: `?facility=${facility}`,
        state: {
          patientId: props.patientId,
        } as StartTestProps,
      });
    } else {
      setRedirect(personPath);
    }
  };
  const saveAndStartTest = async (
    person: Nullable<PersonFormData>,
    startTest: boolean,
    formChanged: boolean
  ) => {
    if (formChanged) {
      await savePerson(person);
    }
    beginTest(startTest);
  };
  const getHeader = (
    person: Nullable<PersonFormData>,
    onSave: (startTest?: boolean) => void,
    formChanged: boolean
  ) => (
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
          {props.fromQueue ? (
            <NavLink
              to={`/queue?facility=${props.facilityId}`}
              className="margin-left-05"
            >
              Conduct tests
            </NavLink>
          ) : (
            <LinkWithQuery to={`/patients`} className="margin-left-05">
              {PATIENT_TERM_PLURAL_CAP}
            </LinkWithQuery>
          )}
        </div>
        <div className="prime-edit-patient-heading margin-y-0">
          <h1 className="font-heading-lg margin-top-1 margin-bottom-0">
            {displayFullName(
              person.firstName,
              person.middleName,
              person.lastName
            )}
          </h1>
        </div>
      </div>
      <div className="display-flex flex-align-center">
        {!props.fromQueue && formChanged ? (
          <Button
            id="edit-patient-save-upper"
            className="prime-save-patient-changes-start-test"
            disabled={loading}
            onClick={() => {
              onSave(true);
            }}
            variant="outline"
            label={"Save and start test"}
          />
        ) : (
          <Button
            id="edit-patient-save-upper"
            className="prime-save-patient-changes-start-test"
            disabled={loading}
            onClick={() => {
              onSave(true);
            }}
            variant="outline"
            label={"Start test"}
          />
        )}
        <button
          className="prime-save-patient-changes usa-button margin-right-0"
          disabled={editPersonLoading || !formChanged}
          onClick={() => onSave(props.fromQueue)}
        >
          {editPersonLoading
            ? `${t("common.button.saving")}...`
            : t("common.button.save")}
        </button>
      </div>
    </div>
  );
  const getFooter = (
    onSave: (startTest?: boolean) => void,
    formChanged: boolean
  ) => (
    <div className="prime-edit-patient-heading">
      <Button
        id="edit-patient-save-lower"
        className="prime-save-patient-changes"
        disabled={editPersonLoading || !formChanged}
        onClick={() => onSave(false)}
        label={
          editPersonLoading
            ? `${t("common.button.saving")}...`
            : t("common.button.save")
        }
      />
    </div>
  );

  const phoneNumberComparator = (x: PhoneNumber, y: PhoneNumber) => {
    // A patient's primary phone number is returned in the
    // query as `telephone` and should be the first element
    // of the array of phone numbers
    if (x.number === data.patient.telephone) {
      return -1;
    } else if (y.number === data.patient.telephone) {
      return 1;
    }
    return 0;
  };

  return (
    <div className="prime-home bg-base-lightest">
      <div className="grid-container">
        <div className="prime-edit-patient">
          <div className={"margin-bottom-4"}>
            <PersonForm
              patient={{
                ...data.patient,
                tribalAffiliation:
                  data.patient.tribalAffiliation?.[0] || undefined,
                phoneNumbers: data.patient.phoneNumbers.sort(
                  phoneNumberComparator
                ),
                facilityId:
                  data.patient.facility === null
                    ? null
                    : data.patient.facility?.id,
                city: data.patient.city === null ? "" : data.patient.city,
                unknownPhoneNumber: data.patient.phoneNumbers.length === 0,
                unknownAddress:
                  data.patient.street === "** Unknown / Not Given **",
              }}
              patientId={props.patientId}
              savePerson={saveAndStartTest}
              getHeader={getHeader}
              getFooter={getFooter}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPatient;
