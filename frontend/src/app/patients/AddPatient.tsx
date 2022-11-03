import React, { useEffect, useState } from "react";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import { useNavigate, NavigateOptions } from "react-router-dom";
import { useTranslation } from "react-i18next";
import moment from "moment";
import { useSelector } from "react-redux";

import iconSprite from "../../../node_modules/uswds/dist/img/sprite.svg";
import {
  PATIENT_TERM,
  PATIENT_TERM_CAP,
  PATIENT_TERM_PLURAL_CAP,
} from "../../config/constants";
import { dedupeAndCompactStrings } from "../utils";
import { showSuccess } from "../utils/srToast";
import Button from "../commonComponents/Button/Button";
import { LinkWithQuery } from "../commonComponents/LinkWithQuery";
import { useDocumentTitle } from "../utils/hooks";
import { useSelectedFacility } from "../facilitySelect/useSelectedFacility";
import { RootState } from "../store";
import { StartTestProps } from "../testQueue/addToQueue/AddToQueueSearch";

import {
  DuplicatePatientModal,
  IdentifyingData,
} from "./Components/DuplicatePatientModal";
import PersonForm from "./Components/PersonForm";

export const EMPTY_PERSON: Nullable<PersonFormData> = {
  facilityId: "",
  firstName: "",
  middleName: null,
  lastName: "",
  lookupId: null,
  role: null,
  race: null,
  ethnicity: null,
  gender: null,
  residentCongregateSetting: undefined,
  employedInHealthcare: undefined,
  tribalAffiliation: undefined,
  birthDate: "",
  telephone: null,
  phoneNumbers: [
    {
      number: "",
      type: "",
    },
  ],
  county: null,
  emails: null,
  street: "",
  streetTwo: null,
  city: null,
  state: "",
  zipCode: "",
  country: "USA",
  preferredLanguage: null,
  testResultDelivery: null,
};

export const PATIENT_EXISTS = gql`
  query PatientExists(
    $firstName: String!
    $lastName: String!
    $birthDate: LocalDate!
    $facilityId: ID
  ) {
    patientExistsWithoutZip(
      firstName: $firstName
      lastName: $lastName
      birthDate: $birthDate
      facilityId: $facilityId
    )
  }
`;

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
    $country: String!
    $telephone: String
    $phoneNumbers: [PhoneNumberInput!]
    $role: String
    $lookupId: String
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
      country: $country
      telephone: $telephone
      phoneNumbers: $phoneNumbers
      role: $role
      lookupId: $lookupId
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
      facility {
        id
      }
    }
  }
`;

type AddPatientParams = Nullable<Omit<PersonFormData, "lookupId">>;

interface AddPatientResponse {
  addPatient: {
    internalId: string;
    facility: {
      id: string;
    };
  };
}

const AddPatient = () => {
  useDocumentTitle("Add Patient");

  const { t } = useTranslation();

  const [addPatient, { loading }] = useMutation<
    AddPatientResponse,
    AddPatientParams
  >(ADD_PATIENT);

  const [identifyingData, setIdentifyingData] = useState<
    Nullable<IdentifyingData>
  >({
    firstName: null,
    lastName: null,
    birthDate: null,
    facilityId: null,
  });
  const [preventModal, setPreventModal] = useState<boolean>(false);

  const [getPatientExists, { data: patientExistsResponse }] = useLazyQuery(
    PATIENT_EXISTS,
    {
      variables: {
        ...identifyingData,
        birthDate: moment(identifyingData.birthDate).format(
          "YYYY-MM-DD"
        ) as ISODate,
      },
    }
  );

  const facilities = useSelector<RootState, Facility[]>(
    (state) => state.facilities
  );

  const organization = useSelector<RootState, { name: string }>(
    (state) => state.organization
  );

  const onBlur = ({
    firstName,
    lastName,
    birthDate,
    facilityId,
  }: Nullable<PersonFormData>) => {
    if (
      firstName !== identifyingData.firstName ||
      lastName !== identifyingData.lastName ||
      !moment(birthDate).isSame(identifyingData.birthDate) ||
      facilityId !== identifyingData.facilityId
    ) {
      setIdentifyingData({
        firstName,
        lastName,
        birthDate: moment(birthDate),
        facilityId,
      });
    }
  };

  useEffect(() => {
    const { firstName, lastName, birthDate } = identifyingData;

    if (firstName && lastName && birthDate?.isValid()) {
      try {
        getPatientExists();
      } catch (e: any) {
        // A failure to check duplicate shouldn't disrupt registration
        console.error(e);
      }
    }
  }, [identifyingData, getPatientExists]);

  const navigate = useNavigate();
  const [activeFacility] = useSelectedFacility();
  const activeFacilityId = activeFacility?.id;

  const personPath = `/patients/?facility=${activeFacilityId}`;

  const [redirect, setRedirect] = useState<
    string | { pathname: string; search: string; state?: any } | undefined
  >(undefined);

  if (!activeFacilityId) {
    return <div>No facility selected</div>;
  }

  const savePerson = async (
    person: Nullable<PersonFormData>,
    startTest: boolean = false
  ) => {
    const { data } = await addPatient({
      variables: {
        ...person,
        phoneNumbers: (person.phoneNumbers || []).filter(
          (phoneNumber: PhoneNumber) => {
            return phoneNumber && phoneNumber.number && phoneNumber.type;
          }
        ),
        emails: dedupeAndCompactStrings(person.emails || []),
      },
    });
    showSuccess(
      "New information record has been created.",
      `${PATIENT_TERM_CAP} record created`
    );

    if (startTest) {
      const facility = data?.addPatient?.facility?.id || activeFacilityId;

      setRedirect({
        pathname: "/queue",
        search: `?facility=${facility}`,
        state: {
          patientId: data?.addPatient.internalId,
        } as StartTestProps,
      });
    } else {
      setRedirect(personPath);
    }
  };

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

  const getSaveButtons = (
    formChanged: boolean,
    onSave: (startTest?: boolean) => void,
    location: string
  ) => (
    <>
      <Button
        id={`edit-patient-save-and-start-${location}`}
        className="prime-save-patient-changes-start-test"
        disabled={loading || !formChanged}
        onClick={() => {
          onSave(true);
        }}
        variant="outline"
        label={
          loading ? `${t("common.button.saving")}...` : "Save and start test"
        }
      />
      <Button
        id={`edit-patient-save-${location}`}
        className="prime-save-patient-changes"
        disabled={loading || !formChanged}
        onClick={() => {
          onSave(false);
        }}
        label={
          loading ? `${t("common.button.saving")}...` : t("common.button.save")
        }
      />
    </>
  );

  return (
    <div className={"prime-edit-patient prime-home"}>
      <div className={"grid-container margin-bottom-4"}>
        <DuplicatePatientModal
          showModal={
            patientExistsResponse?.patientExistsWithoutZip && !preventModal
          }
          onDuplicate={() => setRedirect(personPath)}
          entityName={
            identifyingData.facilityId
              ? facilities.find((f) => f.id === identifyingData.facilityId)
                  ?.name
              : organization.name
          }
          onClose={() => {
            setPreventModal(true);
          }}
        />
        <PersonForm
          patient={EMPTY_PERSON}
          savePerson={savePerson}
          onBlur={onBlur}
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
                    {PATIENT_TERM_PLURAL_CAP}
                  </LinkWithQuery>
                </div>
                <div className="prime-edit-patient-heading margin-y-0">
                  <h1 className="font-heading-lg margin-top-1 margin-bottom-0">
                    Add new {PATIENT_TERM}
                  </h1>
                </div>
              </div>
              <div className="display-flex flex-align-center">
                {getSaveButtons(formChanged, onSave, "upper")}
              </div>
            </div>
          )}
          getFooter={(onSave, formChanged) => (
            <div className="prime-edit-patient-heading">
              {getSaveButtons(formChanged, onSave, "lower")}
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default AddPatient;
