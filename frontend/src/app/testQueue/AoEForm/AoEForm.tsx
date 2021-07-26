import React, { useState } from "react";
import classnames from "classnames";
import moment from "moment";

import {
  globalSymptomDefinitions,
  getTestTypes,
  getPregnancyResponses,
  PregnancyCode,
} from "../../../patientApp/timeOfTest/constants";
import RadioGroup from "../../commonComponents/RadioGroup";
import Button from "../../commonComponents/Button/Button";
import FormGroup from "../../commonComponents/FormGroup";
import RequiredMessage from "../../commonComponents/RequiredMessage";
import "./AoEForm.scss";
import { COVID_RESULTS } from "../../constants";
import { TestResult } from "../QueueItem";

import SymptomInputs from "./SymptomInputs";
import PriorTestInputs from "./PriorTestInputs";

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
  phoneNumbers: PhoneNumber[];
  telephone: string;
  testResultDelivery: string;
}

export interface PriorTest {
  priorTestDate: ISODate | undefined | null;
  priorTestResult: TestResult | undefined | null;
  priorTestType: string | undefined | null;
  firstTest: boolean;
}
export interface AoEAnswersDelivery extends PriorTest {
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

export type LastTest = {
  dateTested: string;
  result: TestResult;
};
interface Props {
  saveButtonText: string;
  onClose?: () => void;
  patient: TestQueuePerson;
  lastTest: LastTest | undefined;
  loadState?: AoEAnswers;
  saveCallback: (response: AoEAnswersDelivery) => void;
  isModal: boolean;
  noValidation: boolean;
  formRef?: React.Ref<HTMLFormElement>;
}

const AoEForm: React.FC<Props> = ({
  saveButtonText,
  onClose,
  patient,
  loadState = {},
  saveCallback,
  isModal,
  noValidation,
  lastTest,
  formRef,
}) => {
  // this seems like it will do a bunch of wasted work on re-renders and non-renders,
  // but it's all small-ball stuff for now
  const testConfig = getTestTypes();
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
  const [isFirstTest, setIsFirstTest] = useState(loadState.firstTest);
  const [priorTestDate, setPriorTestDate] = useState<
    ISODate | undefined | null
  >(loadState.priorTestDate);

  const [priorTestType, setPriorTestType] = useState(loadState.priorTestType);
  const [priorTestResult, setPriorTestResult] = useState<
    TestResult | null | undefined
  >(
    loadState.priorTestResult === undefined
      ? undefined
      : loadState.priorTestResult || null
  );
  const [pregnancyResponse, setPregnancyResponse] = useState(
    loadState.pregnancy
  );
  const [testResultDelivery, setTestResultDelivery] = useState(
    patient.testResultDelivery
  );

  const patientIsOver18 = moment().diff(patient.birthDate, "years") >= 18;

  // Null is OK and preferred over an empty string
  if (lastTest?.dateTested) {
    lastTest.dateTested = lastTest.dateTested.split("T")[0] as ISODate;
  }

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

  const getTestResultDeliveryPreferences = (
    phoneNumbers: PhoneNumber[] | null
  ) => [
    {
      label: (
        <>
          Yes
          <span className="usa-checkbox__label-description">
            <p>
              <span className="radio__label-description--checked">
                <strong>Results will be sent to these numbers:</strong>
              </span>
            </p>
            {(phoneNumbers || []).map(({ number }) => (
              <span className="radio__label-description--checked usa-radio__label-description text-base">
                {number}
              </span>
            ))}
          </span>
        </>
      ),
      value: "SMS",
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
      const priorTest: PriorTest = isFirstTest
        ? {
            firstTest: true,
            priorTestDate: null,
            priorTestType: null,
            priorTestResult: null,
          }
        : {
            firstTest: false,
            priorTestDate: priorTestDate,
            priorTestType: priorTestType,
            priorTestResult:
              !priorTestResult || priorTestResult === COVID_RESULTS.UNKNOWN
                ? null
                : priorTestResult,
          };

      saveCallback({
        noSymptoms,
        symptoms: JSON.stringify(saveSymptoms),
        symptomOnset: onsetDate,
        ...priorTest,
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

  const buttonGroup = (
    <div
      className={classnames(
        "sr-time-of-test-buttons",
        "sr-time-of-test-buttons-footer",
        { "aoe-modal__footer": isModal }
      )}
    >
      <Button
        id="aoe-form-save-button"
        className="margin-right-0"
        label={saveButtonText}
        type={"submit"}
      />
    </div>
  );

  return (
    <>
      <form
        className="display-flex flex-column padding-bottom-10"
        onSubmit={saveAnswers}
        ref={formRef}
      >
        {isModal && (
          <div className="margin-top-4 border-top border-base-lighter" />
        )}
        <RequiredMessage />
        {patientIsOver18 && (
          <FormGroup title="Results">
            <div className="prime-formgroup__wrapper">
              <RadioGroup
                legend="Would you like to receive a copy of your results via text message?"
                name="testResultDelivery"
                onChange={setTestResultDelivery}
                buttons={getTestResultDeliveryPreferences(patient.phoneNumbers)}
                selectedRadio={testResultDelivery}
              />
            </div>
          </FormGroup>
        )}
        <FormGroup title="Symptoms">
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

        <FormGroup title="Test history">
          <div className="prime-formgroup__wrapper">
            <PriorTestInputs
              testTypeConfig={testConfig}
              priorTestDate={priorTestDate}
              setPriorTestDate={setPriorTestDate}
              isFirstTest={isFirstTest}
              setIsFirstTest={setIsFirstTest}
              priorTestType={priorTestType}
              setPriorTestType={setPriorTestType}
              priorTestResult={priorTestResult}
              setPriorTestResult={setPriorTestResult}
              lastTest={lastTest}
            />
          </div>
        </FormGroup>

        {patient.gender?.toLowerCase() !== "male" && (
          <FormGroup title="Pregnancy">
            <RadioGroup
              legend="Currently pregnant?"
              name="pregnancy"
              onChange={setPregnancyResponse}
              buttons={pregnancyResponses}
              selectedRadio={pregnancyResponse}
            />
          </FormGroup>
        )}
        <div
          className={classnames(
            isModal
              ? "modal__footer--sticky position-fixed flex-align-self-end border-top border-base-lighter "
              : "margin-top-3"
          )}
        >
          {buttonGroup}
        </div>
      </form>
    </>
  );
};

export default AoEForm;
