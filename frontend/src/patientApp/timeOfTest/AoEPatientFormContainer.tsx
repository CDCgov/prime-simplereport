import React, { useState } from "react";
import { Redirect } from "react-router";
import { useHistory } from "react-router-dom";
import { connect, useSelector } from "react-redux";
import { gql, useMutation } from "@apollo/client";

import { getPatientLinkIdFromUrl } from "../../app/utils/url";
import PatientTimeOfTestContainer from "../PatientTimeOfTestContainer";
import AoEForm from "../../app/testQueue/AoEForm/AoEForm";

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

const AoEPatientFormContainer = () => {
  const [prevPage, setPrevPage] = useState(false);
  const patient = useSelector((state) => (state as any).patient as any);
  const facility = useSelector((state) => (state as any).facility as any);
  const plid =
    useSelector((state) => (state as any).plid as String) ||
    getPatientLinkIdFromUrl();
  const history = useHistory();
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
    if (action == "POP") {
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
        facilityId={facility.id}
        isModal={false}
        saveButtonText="Submit"
        noValidation={false}
        saveCallback={saveCallback}
      />
    </PatientTimeOfTestContainer>
  );
};

export default connect()(AoEPatientFormContainer);
