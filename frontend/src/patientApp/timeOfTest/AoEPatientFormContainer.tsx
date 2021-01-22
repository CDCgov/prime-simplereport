import React from "react";
import { getFacilityIdFromUrl } from "../../app/utils/url";
import AoEForm from "../../app/testQueue/AoEForm/AoEForm";
import StepIndicator from "../../app/commonComponents/StepIndicator";
import PatientProfile from "./PatientProfile";
import { useSelector } from "react-redux";

interface Props {
  patientId: string;
  page: string;
}

const AoEPatientFormContainer = ({ patientId, page }: Props) => {
  const patient = useSelector((state) => (state as any).patient as any);

  const residentCongregateSetting = patient.residentCongregateSetting
    ? "YES"
    : "NO";

  const facilityId = getFacilityIdFromUrl();
  const employedInHealthcare = patient.employedInHealthcare ? "YES" : "NO";

  const steps = [
    {
      label: "Profile information",
      value: "profile",
      order: 0,
      isCurrent: page === "profile",
    },
    {
      label: "Symptoms and history",
      value: "symptoms",
      order: 1,
      isCurrent: page === "symptoms",
    },
  ];

  return (
    <main className="patient-app patient-app--form padding-bottom-4">
      <div className="grid-container maxw-tablet">
        <StepIndicator steps={steps} />
        {page === "symptoms" && (
          <AoEForm
            patient={{
              ...patient,
              residentCongregateSetting,
              employedInHealthcare,
            }}
            facilityId={facilityId}
            isModal={false}
            saveButtonText="Submit"
            noValidation={false}
          />
        )}
        {page === "profile" && (
          <PatientProfile
            patient={{
              ...patient,
              residentCongregateSetting,
              employedInHealthcare,
            }}
          />
        )}
      </div>
    </main>
  );
};

export default AoEPatientFormContainer;
