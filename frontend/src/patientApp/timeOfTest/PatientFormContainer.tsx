import React, { useEffect, useState } from "react";
import { Redirect } from "react-router-dom";
import { connect, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import PatientForm from "../../app/patients/PatientForm";
import PatientTimeOfTestContainer from "../PatientTimeOfTestContainer";

const PatientFormContainer = () => {
  const [prevPage, setPrevPage] = useState(false);
  const [nextPage, setNextPage] = useState(false);
  const patient = useSelector((state) => (state as any).patient as any);
  const facility = useSelector((state) => (state as any).facility as any);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const history = useHistory();
  history.listen((loc, action) => {
    if (action === "POP") {
      setPrevPage(true);
    }
  });

  const loadPatientConfirmation = () => {
    setNextPage(true);
  };

  if (prevPage) {
    return (
      <Redirect
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

export default connect()(PatientFormContainer);
