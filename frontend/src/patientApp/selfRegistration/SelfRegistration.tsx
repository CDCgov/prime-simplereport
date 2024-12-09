import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import moment from "moment";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";

import { showError } from "../../app/utils/srToast";
import { formatFullName } from "../../app/utils/user";
import PatientHeader from "../PatientHeader";
import { PxpApi, SelfRegistrationData } from "../PxpApiService";
import TermsOfService from "../timeOfTest/TermsOfService";
import Page from "../../app/commonComponents/Page/Page";
import { getAppInsights } from "../../app/TelemetryService";

import { Confirmation } from "./Confirmation";
import { RegistrationContainer } from "./RegistrationContainer";
import { SelfRegistrationForm } from "./SelfRegistrationForm";

enum RegistrationStep {
  TERMS,
  FORM,
  FINISHED,
}

export const SelfRegistration = () => {
  const appInsights = getAppInsights();
  const { registrationLink } = useParams<{
    registrationLink: string | undefined;
  }>();
  const [step, setStep] = useState(RegistrationStep.TERMS);
  const [entityName, setEntityName] = useState("");
  const [personName, setPersonName] = useState("");

  const { t } = useTranslation();

  useEffect(() => {
    if (window?.visualViewport?.width) {
      appInsights?.trackMetric(
        {
          name: "userViewport_selfRegistration",
          average: window.visualViewport.width,
        },
        {
          width: window.visualViewport.width,
          height: window.visualViewport.height,
        }
      );
    }
  }, [appInsights]);

  const savePerson = async (person: Nullable<PersonFormData>) => {
    const {
      street,
      streetTwo,
      city,
      state,
      county,
      zipCode,
      birthDate,
      ...withoutAddress
    } = person;
    const formattedBirthDate = moment(birthDate).format(
      "YYYY-MM-DD"
    ) as ISODate;

    const data: SelfRegistrationData = {
      registrationLink,
      birthDate: formattedBirthDate,
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
    } catch {
      showError(
        t("selfRegistration.form.error.heading"),
        t("selfRegistration.form.error.text")
      );
    }
  };

  const onDuplicate = (
    person: Pick<PersonFormData, "firstName" | "lastName">
  ) => {
    setStep(RegistrationStep.FINISHED);
    setPersonName(
      formatFullName({
        firstName: person.firstName,
        lastName: person.lastName,
        middleName: "",
      }) || ""
    );
  };

  return (
    <div className="bg-base-lightest minh-viewport">
      <Page
        header={
          <div className="bg-white">
            <PatientHeader />
          </div>
        }
        children={
          <div>
            <RegistrationContainer
              registrationLink={registrationLink}
              setEntityName={setEntityName}
            >
              <div className="bg-white padding-y-105">
                <div className="grid-container maxw-tablet">
                  <h1 className="margin-top-0 margin-bottom-1">
                    {step === RegistrationStep.FINISHED
                      ? t("selfRegistration.form.complete")
                      : t("selfRegistration.form.inProgress")}
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
                  <SelfRegistrationForm
                    savePerson={savePerson}
                    onDuplicate={onDuplicate}
                    entityName={entityName}
                    registrationLink={registrationLink}
                  />
                )}
                {step === RegistrationStep.FINISHED && (
                  <Confirmation
                    personName={personName}
                    entityName={entityName}
                  />
                )}
              </div>
            </RegistrationContainer>
          </div>
        }
        isPatientApp={true}
      />
    </div>
  );
};
