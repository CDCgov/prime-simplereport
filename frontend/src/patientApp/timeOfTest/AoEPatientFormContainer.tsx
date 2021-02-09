import React from "react";
import AoEForm from "../../app/testQueue/AoEForm/AoEForm";
import StepIndicator from "../../app/commonComponents/StepIndicator";
import PatientProfile from "./PatientProfile";
import { connect, useSelector } from "react-redux";
import { gql, useMutation } from "@apollo/client";

const PATIENT_LINK_SUBMIT_MUTATION = gql`
  mutation PatientLinkById(
    $plid: String!
    $birthDate: String!
    $pregnancy: String
    $symptoms: String
    $firstTest: Boolean
    $priorTestDate: String
    $priorTestType: String
    $priorTestResult: String
    $symptomOnset: String
    $noSymptoms: Boolean
  ) {
    patientLinkSubmit(
      internalId: $plid
      birthDate: $birthDate
      pregnancy: $pregnancy
      symptoms: $symptoms
      firstTest: $firstTest
      priorTestDate: $priorTestDate
      priorTestType: $priorTestType
      priorTestResult: $priorTestResult
      symptomOnset: $symptomOnset
      noSymptoms: $noSymptoms
    )
  }
`;

interface Props {
  page: string;
}

const AoEPatientFormContainer = ({ page }: Props) => {
  const patient = useSelector((state) => (state as any).patient as any);
  const plid = useSelector((state) => (state as any).plid as String);

  const residentCongregateSetting = patient.residentCongregateSetting
    ? "YES"
    : "NO";

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

  const [submitMutation] = useMutation(PATIENT_LINK_SUBMIT_MUTATION);
  const saveCallback = (args: any) => {
    submitMutation({
      variables: {
        ...args,
        plid,
        birthDate: patient.birthDate,
      },
    });
  };

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
            isModal={false}
            saveButtonText="Submit"
            noValidation={false}
            saveCallback={saveCallback}
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

export default connect()(AoEPatientFormContainer);
