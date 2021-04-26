import React from "react";

import StepIndicator from "../app/commonComponents/StepIndicator";

import { getTimeOfTestSteps } from "./timeOfTest/constants";

interface Props {
  children: React.ReactNode;
  currentPage: string;
}

const PatientTimeOfTestContainer = ({ children, currentPage }: Props) => {
  const steps = getTimeOfTestSteps();

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
