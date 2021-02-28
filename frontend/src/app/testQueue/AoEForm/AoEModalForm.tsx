import React, { useRef, useState } from "react";
import QRCode from "react-qr-code";
import Modal from "react-modal";
import AoEForm from "./AoEForm";
import Button from "../../commonComponents/Button";
import RadioGroup from "../../commonComponents/RadioGroup";
import { displayFullName, showError } from "../../utils";
import { globalSymptomDefinitions } from "../../../patientApp/timeOfTest/constants";
import { getUrl } from "../../utils/url";
import { gql, useQuery, useMutation } from "@apollo/client";
import { toast } from "react-toastify";

// the QR code is separately feature flagged – we need it for the e2e tests currently
const qrCodeOption = process.env.REACT_APP_QR_CODE_ENABLED
  ? [{ label: "Complete on smartphone", value: "smartphone" }]
  : [];

interface LastTestData {
  patient: {
    lastTest: {
      dateTested: string;
      result: string;
    };
  };
}

export const LAST_TEST_QUERY = gql`
  query GetPatientsLastResult($patientId: String!) {
    patient(id: $patientId) {
      lastTest {
        dateTested
        result
      }
    }
  }
`;

export const SEND_SMS_MUTATION = gql`
  mutation sendPatientLinkSms($internalId: String!) {
    sendPatientLinkSms(internalId: $internalId)
  }
`;

interface AoEModalProps {
  saveButtonText?: string;
  onClose: () => void;
  patient: any;
  loadState?: any;
  saveCallback: (a: any) => string | void;
  patientLinkId?: string;
}

interface SmsModalProps {
  smsSuccess: boolean;
  telephone: string;
  patientLinkId: string | null;
  patientResponse: any;
  sendSmsMutation: any;
  setSmsSuccess: (val: boolean) => void;
  saveCallback: (a: any) => string | void;
  continueModal: () => void;
}

const SmsModalContents = ({
  smsSuccess,
  telephone,
  patientLinkId,
  patientResponse,
  sendSmsMutation,
  setSmsSuccess,
  saveCallback,
  continueModal,
}: SmsModalProps) => {
  const sendSms = async () => {
    const internalId = patientLinkId || (await saveCallback(patientResponse));
    try {
      await sendSmsMutation({ variables: { internalId } });
      setSmsSuccess(true);
    } catch (e) {
      showError(toast, "SMS error", e);
    }
  };
  return (
    <>
      {smsSuccess && (
        <div className="usa-alert usa-alert--success outline-0">
          <div className="usa-alert__body">
            <h3 className="usa-alert__heading">Text message sent</h3>
            <p className="usa-alert__text">The link was sent to {telephone}</p>
          </div>
        </div>
      )}
      <div className="border-top border-base-lighter margin-x-neg-205 margin-top-5 padding-top-205 text-right">
        {!smsSuccess ? (
          <Button
            className="margin-right-205"
            label="Text link"
            type={"button"}
            onClick={() => sendSms()}
          />
        ) : (
          <Button
            className="margin-right-205"
            label="Continue"
            type={"button"}
            onClick={() => continueModal()}
          />
        )}
      </div>
    </>
  );
};

const AoEModalForm = (props: AoEModalProps) => {
  const {
    saveButtonText = "Continue",
    onClose,
    patient,
    loadState = {},
    saveCallback,
    patientLinkId = "",
  } = props;

  const [modalView, setModalView] = useState("");
  const [patientLink, setPatientLink] = useState("");
  const [smsSuccess, setSmsSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const modalViewValues = [
    {
      label: (
        <>
          Text link to complete on smartphone
          <span className="radio__label-description--checked usa-radio__label-description text-base">
            {patient.telephone}
          </span>
        </>
      ),
      value: "text",
    },
    ...qrCodeOption,
    { label: "Complete questionnaire verbally", value: "verbal" },
  ];

  const symptomsResponse: { [key: string]: boolean } = {};
  globalSymptomDefinitions.forEach(({ value }) => {
    symptomsResponse[value] = false;
  });

  const patientResponse = {
    firstTest: false,
    noSymptoms: false,
    pregnancy: undefined,
    priorTestDate: undefined,
    priorTestResult: null,
    priorTestType: undefined,
    symptomOnset: undefined,
    symptoms: JSON.stringify(symptomsResponse),
  };

  const [sendSmsMutation] = useMutation(SEND_SMS_MUTATION);
  const { data, loading, error } = useQuery<LastTestData, {}>(LAST_TEST_QUERY, {
    fetchPolicy: "no-cache",
    variables: { patientId: patient.internalId },
  });
  if (loading) {
    return null;
  }
  if (error) {
    throw error;
  }
  const lastTest = data?.patient.lastTest;

  const continueModal = () => {
    // No need to save form if in "smartphone" mode
    if (modalView === "smartphone") {
      return onClose();
    }
    // Save default if form doesn't exist, otherwise submit form
    if (!formRef?.current) {
      saveCallback(patientResponse);
    } else {
      formRef.current.dispatchEvent(new Event("submit"));
    }
    return onClose();
  };

  const chooseModalView = async (view: string) => {
    if (view === "smartphone") {
      // if we already have a truthy qrCodeValue, we do not need to save the test order to generate a PLID
      setPatientLink(
        `${getUrl()}pxp?plid=${
          patientLinkId || (await saveCallback(patientResponse))
        }`
      );
    }
    setModalView(view);
  };

  const buttonGroup = (
    <div className="sr-time-of-test-buttons">
      <Button variant="unstyled" label="Cancel" onClick={onClose} />
      <Button
        className="margin-right-0"
        label={saveButtonText}
        type={"button"}
        onClick={() => continueModal()}
      />
    </div>
  );

  const verbalForm = (
    <AoEForm
      saveButtonText="Continue"
      onClose={onClose}
      patient={patient}
      loadState={loadState}
      saveCallback={saveCallback}
      isModal={true}
      noValidation={true}
      formRef={formRef}
      lastTest={lastTest}
    />
  );

  const modalContents = () => {
    // the pre-patient-experience situation is way simpler!
    if (process.env.REACT_APP_PATIENT_EXPERIENCE_ENABLED !== "true") {
      return verbalForm;
    }

    let innerContents = null;
    switch (modalView) {
      case "verbal":
        innerContents = verbalForm;
        break;
      case "text":
        innerContents = (
          <SmsModalContents
            smsSuccess={smsSuccess}
            setSmsSuccess={setSmsSuccess}
            telephone={patient.telephone}
            continueModal={continueModal}
            patientLinkId={patientLinkId}
            sendSmsMutation={sendSmsMutation}
            patientResponse={patientResponse}
            saveCallback={saveCallback}
          />
        );
        break;
      case "smartphone":
        innerContents = (
          <>
            <section className="display-flex flex-justify-center margin-top-4 padding-top-5 border-top border-base-lighter">
              <div className="text-center">
                <p className="font-body-lg margin-y-0">
                  Point your camera at the QR code <br />
                  to access the questionnaire
                </p>
                <div
                  className="margin-top-205"
                  id="patient-link-qr-code"
                  data-patient-link={patientLink}
                >
                  <QRCode value={patientLink} size={190} />
                </div>
              </div>
            </section>
            <div className="border-top border-base-lighter margin-x-neg-205 margin-top-5 padding-top-205 text-right">
              <Button
                className="margin-right-205"
                label={saveButtonText}
                type={"button"}
                onClick={() => continueModal()}
              />
            </div>
          </>
        );
        break;
      default:
        break;
    }

    return (
      <>
        <h2 className="font-heading-lg margin-top-205 margin-bottom-0">
          Test questionnaire
        </h2>
        <RadioGroup
          legend="How would you like to complete the questionnaire?"
          name="qr-code"
          type="radio"
          onChange={(evt) => chooseModalView(evt.currentTarget.value)}
          buttons={modalViewValues}
          selectedRadio={modalView}
          className="margin-top-205"
        />
        {innerContents}
      </>
    );
  };

  return (
    <Modal
      isOpen={true}
      style={{
        content: {
          maxHeight: "90vh",
          width: "40em",
          position: "initial",
        },
      }}
      overlayClassName="prime-modal-overlay display-flex flex-align-center flex-justify-center"
      contentLabel="Test questionnaire"
    >
      <div className="display-flex flex-justify">
        <h1 className="font-heading-lg margin-top-05 margin-bottom-0">
          {displayFullName(
            patient.firstName,
            patient.middleName,
            patient.lastName
          )}
        </h1>
        {buttonGroup}
      </div>
      <div className="border-top border-base-lighter margin-x-neg-205 margin-top-205"></div>
      {modalContents()}
    </Modal>
  );
};

AoEModalForm.propTypes = {};

export default AoEModalForm;
