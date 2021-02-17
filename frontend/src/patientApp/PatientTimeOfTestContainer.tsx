import React from "react";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";

import { getTimeOfTestSteps } from "./timeOfTest/constants";
import StepIndicator from "./StepIndicator";

interface Props {
  children: React.ReactNode;
  currentPage: string;
}

const PatientTimeOfTestContainer = ({ children, currentPage }: Props) => {
  const steps = getTimeOfTestSteps();
  const plid = useSelector((state) => (state as any).plid as String);
  const history = useHistory();

  const setPatientLinkId = (patientLinkId: String) => {
    history.push({ search: `?plid=${patientLinkId}` });
  };

  if (plid == null) {
    throw new Error("Patient Link ID from URL was null");
  } else {
    setPatientLinkId(plid);
  }

  return (
    <main className="patient-app patient-app--form padding-bottom-4">
      <div className="grid-container maxw-tablet">
        <StepIndicator steps={steps} currentStepValue={currentPage} />
        {children}
      </div>
    </main>
  );
};

export default PatientTimeOfTestContainer;
