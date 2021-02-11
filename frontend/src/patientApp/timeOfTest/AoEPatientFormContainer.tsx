import React, { useState } from "react";
import { Redirect } from "react-router";
import { useHistory } from "react-router-dom";
import AoEForm from "../../app/testQueue/AoEForm/AoEForm";
import StepIndicator from "../../app/commonComponents/StepIndicator";
import PatientProfile from "./PatientProfile";
import { connect, useSelector } from "react-redux";
import { gql, useMutation } from "@apollo/client";

import { getPatientLinkIdFromUrl } from "../../app/utils/url";
import PatientTimeOfTestContainer from "../PatientTimeOfTestContainer";

const PATIENT_LINK_SUBMIT_MUTATION = gql`
  mutation PatientLinkById(
    $plid: String!
    $birthDate: LocalDate!
    $pregnancy: String
    $symptoms: String
    $firstTest: Boolean
    $priorTestDate: LocalDate
    $priorTestType: String
    $priorTestResult: String
    $symptomOnset: LocalDate
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
  const [prevPage, setPrevPage] = useState(false);
  const patient = useSelector((state) => (state as any).patient as any);
  const facility = useSelector((state) => (state as any).facility as any);
  const plid =
    useSelector((state) => (state as any).plid as String) ||
    getPatientLinkIdFromUrl();
  const history = useHistory();

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

  history.listen((loc, action) => {
    if (action === "POP") {
      setPrevPage(true);
    }
  });

  if (prevPage) {
    return (
      <Redirect
        push
        to={{
          pathname: "/patient-info-confirm",
        }}
      />
    );
  }

  return (
    <PatientTimeOfTestContainer currentPage={"symptoms"}>
      <AoEForm
        patient={patient}
        isModal={false}
        saveButtonText="Submit"
        noValidation={false}
        saveCallback={saveCallback}
      />
    </PatientTimeOfTestContainer>
  );
};

export default connect()(AoEPatientFormContainer);
