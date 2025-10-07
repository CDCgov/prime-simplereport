import React, { useState } from "react";
import classnames from "classnames";

import {
  globalSymptomDefinitions,
  getPregnancyResponses,
  PregnancyCode,
} from "../../../patientApp/timeOfTest/constants";
import RadioGroup from "../../commonComponents/RadioGroup";
import Button from "../../commonComponents/Button/Button";
import FormGroup from "../../commonComponents/FormGroup";
import RequiredMessage from "../../commonComponents/RequiredMessage";
import {
  TestResultDeliveryPreference,
  TestResultDeliveryPreferences,
} from "../../patients/TestResultDeliveryPreference";
import {
  getSelectedDeliveryPreferencesEmail,
  getSelectedDeliveryPreferencesSms,
  toggleDeliveryPreferenceEmail,
  toggleDeliveryPreferenceSms,
} from "../../utils/deliveryPreferences";

import "./AoEForm.scss";

import SymptomInputs from "./SymptomInputs";

// Get the value associate with a button label
// TODO: move to utility?
const findValueForLabel = (
  label: string,
  list: { label: string; value: string }[]
) => (list.filter((item) => item.label === label)[0] || {}).value;

export interface TestQueuePerson {
  internalId: string;
  birthDate: string;
  gender: Gender | null;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string;
  emails: string[];
  phoneNumbers: PhoneNumber[];
  telephone: string;
  testResultDelivery: string;
}

export interface AoEAnswersDelivery {
  noSymptoms: boolean;
  symptoms: string;
  symptomOnset: ISODate | null | undefined;
  pregnancy: PregnancyCode | undefined;
  testResultDelivery: string;
}

type RequiredAndNotNull<T> = {
  [P in keyof T]: Exclude<T[P], null | undefined>;
};

export type AoEAnswers = Omit<
  RequiredAndNotNull<AoEAnswersDelivery>,
  "testResultDelivery"
>;

interface Props {
  saveButtonText: string;
  onClose?: () => void;
  patient: TestQueuePerson;
  loadState?: AoEAnswers;
  saveCallback: (response: AoEAnswersDelivery) => void;
  isModal: boolean;
  noValidation: boolean;
}

const AoEForm: React.FC<Props> = ({
  saveButtonText,
  onClose,
  patient,
  loadState = {},
  saveCallback,
  isModal,
  noValidation,
}) => {
  // this seems like it will do a bunch of wasted work on re-renders and non-renders,
  // but it's all small-ball stuff for now
  const symptomConfig = globalSymptomDefinitions;
  const initialSymptoms: { [key: string]: boolean } = {};
  if (loadState.symptoms) {
    const loadedSymptoms: { [key: string]: string | boolean } = JSON.parse(
      loadState.symptoms
    );

    symptomConfig.forEach((opt) => {
      const val = opt.value;
      if (typeof loadedSymptoms[val] === "string") {
        initialSymptoms[val] = loadedSymptoms[val] === "true";
      } else {
        initialSymptoms[val] = loadedSymptoms[val] as boolean;
      }
    });
  } else {
    symptomConfig.forEach((opt) => {
      initialSymptoms[opt.value] = false;
    });
  }

  const [noSymptoms, setNoSymptoms] = useState(loadState.noSymptoms || false);
  const [currentSymptoms, setSymptoms] = useState(initialSymptoms);
  const [onsetDate, setOnsetDate] = useState<ISODate | undefined | null>(
    loadState.symptomOnset
  );
  const [pregnancyResponse, setPregnancyResponse] = useState(
    loadState.pregnancy
  );
  const [testResultDelivery, setTestResultDelivery] = useState(
    patient.testResultDelivery
  );

  // form validation
  const [symptomError, setSymptomError] = useState<string | undefined>();
  const [symptomOnsetError, setSymptomOnsetError] = useState<
    string | undefined
  >();
  const symptomRef = React.createRef<HTMLInputElement>();
  const symptomOnsetRef = React.createRef<HTMLInputElement>();

  const isValidForm = () => {
    if (noValidation) return true;
    const hasSymptoms = Object.keys(currentSymptoms).some(
      (key) => currentSymptoms[key]
    );
    if (!noSymptoms && !hasSymptoms) {
      setSymptomError("Select your symptoms");
      setSymptomOnsetError(undefined);
      symptomRef?.current?.focus();
      return false;
    }

    if (noSymptoms) {
      setSymptomError(undefined);
      setSymptomOnsetError(undefined);
      return true;
    }

    if (hasSymptoms && !onsetDate) {
      setSymptomError(undefined);
      setSymptomOnsetError("Enter the date of symptom onset");
      symptomOnsetRef?.current?.focus();
      return false;
    }

    if (hasSymptoms && onsetDate) {
      setSymptomError(undefined);
      setSymptomOnsetError(undefined);
      return true;
    }
  };

  const getTestResultDeliveryPreferencesSms = (phoneNumbers: PhoneNumber[]) => [
    {
      label: (
        <>
          Yes, text all mobile numbers on file.
          <span className="usa-checkbox__label-description">
            <p>
              {phoneNumbers.length > 0 ? (
                <span className="radio__label-description--checked">
                  <strong>Results will be sent to these numbers:</strong>
                </span>
              ) : (
                "(There are no mobile phone numbers listed in your patient profile.)"
              )}
            </p>
            {phoneNumbers.map(({ number }) => (
              <span
                key={number}
                className="radio__label-description--checked usa-radio__label-description text-base"
              >
                {number}
              </span>
            ))}
          </span>
        </>
      ),
      value: "SMS",
      ...(phoneNumbers.length === 0 && { disabled: true }),
    },
    { label: "No", value: "NONE" },
  ];

  const getTestResultDeliveryPreferencesEmail = (emails: string[] = []) => [
    {
      label: (
        <>
          Yes
          <span className="usa-checkbox__label-description">
            <p>
              {emails.length > 0 ? (
                <span className="radio__label-description--checked">
                  <strong>
                    Results will be sent to these email addresses:
                  </strong>
                </span>
              ) : (
                "(There are no email addresses listed in your patient profile.)"
              )}
            </p>
            {emails.map((email) => (
              <span
                key={`test-result-delivery-preference-email-${email}`}
                className="radio__label-description--checked usa-radio__label-description text-base"
              >
                {email}
              </span>
            ))}
          </span>
        </>
      ),
      value: "EMAIL",
      ...(emails.length === 0 && { disabled: true }),
    },
    { label: "No", value: "NONE" },
  ];

  // Auto-answer pregnancy question for males
  const pregnancyResponses = getPregnancyResponses();
  if (patient.gender === "male" && !pregnancyResponse) {
    setPregnancyResponse(
      findValueForLabel("No", pregnancyResponses) as PregnancyCode
    );
  }

  const saveAnswers = (e: React.FormEvent) => {
    if (isValidForm()) {
      const saveSymptoms = { ...currentSymptoms };
      if (noSymptoms) {
        // set all symptoms explicitly to false
        symptomConfig.forEach(({ value }) => {
          saveSymptoms[value] = false;
        });
      }

      saveCallback({
        noSymptoms,
        symptoms: JSON.stringify(saveSymptoms),
        symptomOnset: onsetDate,
        pregnancy: pregnancyResponse,
        testResultDelivery,
      });
      if (isModal && onClose) {
        onClose();
      } else {
        // pxp must not use dom form's action->post
        e.preventDefault();
      }
    } else {
      e.preventDefault();
    }
  };

  const patientMobileNumbers = (patient.phoneNumbers || []).filter(
    (phoneNumber) => phoneNumber.type === "MOBILE"
  );

  return (
    <div>
      <form className="display-flex flex-column padding-bottom-4">
        <RequiredMessage />
        <FormGroup title="Results" asSectionGroup>
          <div className="prime-formgroup__wrapper">
            <RadioGroup
              legend="Would you like to receive a copy of your results via text message?"
              hintText="You’re responsible for entering the correct contact information, following applicable federal and state laws."
              wrapperClassName="margin-top-0"
              name="testResultDeliverySms"
              onChange={(newPreference) => {
                setTestResultDelivery(
                  toggleDeliveryPreferenceSms(
                    testResultDelivery as TestResultDeliveryPreference,
                    newPreference as TestResultDeliveryPreference
                  )
                );
              }}
              buttons={getTestResultDeliveryPreferencesSms(
                patientMobileNumbers
              )}
              selectedRadio={getSelectedDeliveryPreferencesSms(
                testResultDelivery as TestResultDeliveryPreference
              )}
            />
          </div>
          <div className="prime-formgroup__wrapper">
            <RadioGroup
              legend="Would you like to receive a copy of your results via email?"
              hintText="You’re responsible for entering the correct contact information, following applicable federal and state laws."
              wrapperClassName="margin-top-0"
              name="testResultDeliveryEmail"
              onChange={(newPreference) => {
                setTestResultDelivery(
                  toggleDeliveryPreferenceEmail(
                    testResultDelivery as TestResultDeliveryPreference,
                    newPreference as TestResultDeliveryPreference
                  )
                );
              }}
              buttons={getTestResultDeliveryPreferencesEmail(patient.emails)}
              selectedRadio={(() => {
                if ((patient.emails || []).length === 0) {
                  return TestResultDeliveryPreferences.NONE;
                }

                return getSelectedDeliveryPreferencesEmail(
                  testResultDelivery as TestResultDeliveryPreference
                );
              })()}
            />
          </div>
        </FormGroup>
        <FormGroup title="Symptoms" asSectionGroup>
          <SymptomInputs
            noSymptoms={noSymptoms}
            setNoSymptoms={setNoSymptoms}
            currentSymptoms={currentSymptoms}
            setSymptoms={setSymptoms}
            setOnsetDate={setOnsetDate}
            onsetDate={onsetDate}
            symptomError={symptomError}
            symptomOnsetError={symptomOnsetError}
            symptomRef={symptomRef}
            symptomOnsetRef={symptomOnsetRef}
          />
        </FormGroup>

        {patient.gender?.toLowerCase() !== "male" && (
          <FormGroup title="Pregnancy" asSectionGroup>
            <RadioGroup
              legend="Are you currently pregnant?"
              name="pregnancy"
              onChange={setPregnancyResponse}
              buttons={pregnancyResponses}
              selectedRadio={pregnancyResponse}
            />
          </FormGroup>
        )}
      </form>
      <div
        className={classnames(
          isModal
            ? "modal__footer--sticky flex-align-self-end border-base-lighter "
            : "margin-top-3"
        )}
      >
        <div
          className={classnames(
            "sr-time-of-test-buttons",
            "sr-time-of-test-buttons-footer"
          )}
        >
          <Button
            id="aoe-form-save-button"
            className="margin-right-0"
            label={saveButtonText}
            onClick={saveAnswers}
          />
        </div>
      </div>
    </div>
  );
};

export default AoEForm;
