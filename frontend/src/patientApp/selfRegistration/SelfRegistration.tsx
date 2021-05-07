import { useState } from "react";
import { useParams } from "react-router";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import USAGovBanner from "../../app/commonComponents/USAGovBanner";
import { showError } from "../../app/utils";
import { formatFullName } from "../../app/utils/user";
import PatientHeader from "../PatientHeader";
import { PxpApi } from "../PxpApiService";
import TermsOfService from "../timeOfTest/TermsOfService";

import { Confirmation } from "./Confirmation";
import { RegistrationContainer } from "./RegistrationContainer";
import { SelfRegistrationForm } from "./SelfRegistrationForm";

enum RegistrationStep {
  TERMS,
  FORM,
  FINISHED,
}

export const SelfRegistration = () => {
  const { registrationLink } = useParams<{ registrationLink: string }>();
  const [step, setStep] = useState(RegistrationStep.TERMS);
  const [entityName, setEntityName] = useState("");
  const [personName, setPersonName] = useState("");

  const savePerson = async (person: Nullable<PersonFormData>) => {
    const {
      street,
      streetTwo,
      city,
      state,
      county,
      zipCode,
      facilityId,
      ...withoutAddress
    } = person;

    const data = {
      registrationLink,
      ...withoutAddress,
      address: {
        street: [street, streetTwo],
        city,
        state,
        county,
        postalCode: zipCode,
      },
    };

    try {
      await PxpApi.selfRegister(data);
      setPersonName(formatFullName(person) || "");
      setStep(RegistrationStep.FINISHED);
    } catch (e) {
      showError(toast, "There was a registration error", "Registration error");
    }
  };

  return (
    <div className="bg-base-lightest minh-viewport">
      <div className="bg-white">
        <USAGovBanner />
        <PatientHeader />
      </div>
      <RegistrationContainer
        registrationLink={registrationLink}
        setEntityName={setEntityName}
      >
        <div className="bg-white padding-y-105">
          <div className="grid-container maxw-tablet">
            <h1 className="margin-top-0 margin-bottom-1">
              {step === RegistrationStep.FINISHED
                ? "Registration complete"
                : "Register for your test"}
            </h1>
            <h2 className="margin-y-0 text-normal">{entityName}</h2>
          </div>
        </div>
        <div className="bg-base-lightest">
          {step === RegistrationStep.TERMS && (
            <TermsOfService
              className="padding-top-05"
              onAgree={() => {
                setStep(RegistrationStep.FORM);
              }}
            />
          )}
          {step === RegistrationStep.FORM && (
            <SelfRegistrationForm savePerson={savePerson} />
          )}
          {step === RegistrationStep.FINISHED && (
            <Confirmation personName={personName} entityName={entityName} />
          )}
        </div>
      </RegistrationContainer>
      <ToastContainer
        autoClose={5000}
        closeButton={false}
        limit={2}
        position="bottom-center"
        hideProgressBar={true}
      />
    </div>
  );
};
