import { useState } from "react";
import { useParams } from "react-router";

import USAGovBanner from "../../app/commonComponents/USAGovBanner";
import PatientHeader from "../PatientHeader";
import TermsOfService from "../timeOfTest/TermsOfService";

import { RegistrationContainer } from "./RegistrationContainer";

export const SelfRegistration = () => {
  const { registrationLink } = useParams<{ registrationLink: string }>();
  const [entityName, setEntityName] = useState<string>();

  return (
    <>
      <USAGovBanner />
      <PatientHeader />
      <RegistrationContainer
        registrationLink={registrationLink}
        setEntityName={setEntityName}
      >
        <div className="grid-container maxw-tablet">
          <h1 className="margin-bottom-1">Register for your test</h1>
          <h2 className="margin-top-0 text-normal">{entityName}</h2>
        </div>
        <TermsOfService className="padding-top-05" onAgree={() => {}} />
      </RegistrationContainer>
    </>
  );
};
