import React, { useEffect, useState } from "react";
import { useHistory, Redirect } from "react-router-dom";
import { connect, useSelector } from "react-redux";

import AoEForm from "../../app/testQueue/AoEForm/AoEForm";
import { showError } from "../../app/utils";
import { getPatientLinkIdFromUrl } from "../../app/utils/url";
import PatientTimeOfTestContainer from "../PatientTimeOfTestContainer";
import { PxpApi } from "../PxpApiService";

interface Props {
  page: string;
}

const AoEPatientFormContainer: React.FC<Props> = ({ page }: Props) => {
  const [prevPage, setPrevPage] = useState(false);
  const [nextPage, setNextPage] = useState(false);
  const patient = useSelector((state) => (state as any).patient as any);
  const plid =
    useSelector((state) => (state as any).plid) || getPatientLinkIdFromUrl();
  const history = useHistory();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const saveCallback = async (data: any) => {
    try {
      await PxpApi.submitQuestions(plid as string, patient.birthDate, data);
      setNextPage(true);
    } catch (e) {
      showError("There was an error submitting your responses");
      return;
    }
  };

  history.listen((loc, action) => {
    if (action === "POP") {
      setPrevPage(true);
    }
  });

  if (nextPage) {
    return (
      <Redirect
        to={{
          pathname: "/success",
        }}
      />
    );
  }

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
        lastTest={patient.lastTest}
        saveCallback={saveCallback}
      />
    </PatientTimeOfTestContainer>
  );
};

export default connect()(AoEPatientFormContainer);
