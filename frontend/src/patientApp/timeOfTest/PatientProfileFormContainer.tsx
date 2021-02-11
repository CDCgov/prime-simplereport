import React, { useState, useEffect } from "react";
import { Redirect } from "react-router";
import { useDispatch, connect, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { gql, useLazyQuery } from "@apollo/client";

import { setPatient } from "../../app/store";
import { getPatientLinkIdFromUrl } from "../../app/utils/url";
import PatientForm from "../../app/patients/PatientForm";
import PatientTimeOfTestContainer from "../PatientTimeOfTestContainer";

const PATIENT_LINK_VALIDATION_QUERY = gql`
  query PatientLinkVerify($plid: String!, $birthDate: LocalDate!) {
    patientLinkVerify(internalId: $plid, birthDate: $birthDate) {
      internalId
      firstName
      middleName
      lastName
      birthDate
      street
      streetTwo
      city
      state
      zipCode
      telephone
      role
      email
      county
      race
      ethnicity
      gender
      residentCongregateSetting
      employedInHealthcare
    }
  }
`;

const PatientProfileFormContainer = () => {
  const dispatch = useDispatch();
  const [prevPage, setPrevPage] = useState(false);
  const [nextPage, setNextPage] = useState(false);
  const patient = useSelector((state) => (state as any).patient as any);
  const facility = useSelector((state) => (state as any).facility as any);

  const plid = getPatientLinkIdFromUrl();
  const history = useHistory();

  const [validateAndGetPatient, { called, loading, data }] = useLazyQuery(
    PATIENT_LINK_VALIDATION_QUERY,
    {
      variables: { plid, birthDate: patient.birthDate },
      fetchPolicy: "no-cache",
    }
  );

  useEffect(() => {
    if (!data) return;
    const updatedPatient = data.patientLinkVerify;
    const residentCongregateSetting = patient.residentCongregateSetting
      ? "YES"
      : "NO";
    const employedInHealthcare = patient.employedInHealthcare ? "YES" : "NO";

    dispatch(
      setPatient({
        ...updatedPatient,
        residentCongregateSetting,
        employedInHealthcare,
      })
    );

    // eslint-disable-next-line
  }, [data]);
  if (called && loading) {
    return <p>Validating birth date and retrieving patient info...</p>;
  }

  history.listen((loc, action) => {
    if (action === "POP") {
      setPrevPage(true);
    }
  });

  const loadPatientConfirmation = () => {
    validateAndGetPatient();
    setNextPage(true);
  };

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

  if (nextPage) {
    return (
      <Redirect
        push
        to={{
          pathname: "/patient-info-symptoms",
        }}
      />
    );
  }

  return (
    <PatientTimeOfTestContainer currentPage={"profile"}>
      <PatientForm
        patient={patient}
        activeFacilityId={facility.id}
        patientId={patient.internalId}
        isPxpView={true}
        backCallback={() => {
          setPrevPage(true);
        }}
        saveCallback={() => {
          loadPatientConfirmation();
        }}
      />
    </PatientTimeOfTestContainer>
  );
};

export default connect()(PatientProfileFormContainer);
