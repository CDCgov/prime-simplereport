import React, { useState } from "react";
import { Redirect } from "react-router";
import { useHistory } from "react-router-dom";
import { connect, useSelector } from "react-redux";

import Button from "../../app/commonComponents/Button";
import PatientTimeOfTestContainer from "../PatientTimeOfTestContainer";
import PatientProfile from "./PatientProfile";

const PatientProfileContainer = () => {
  const history = useHistory();
  const [nextPage, setNextPage] = useState(false);
  const [editPage, setEditPage] = useState(false);
  const [prevPage, setPrevPage] = useState(false);
  const patient = useSelector((state) => (state as any).patient as any);

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
          pathname: "/birth-date-confirmation",
        }}
      />
    );
  }

  if (editPage) {
    return (
      <Redirect
        push
        to={{
          pathname: "/patient-info-edit",
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

  const buttonGroup = (
    <>
      <div className="margin-top-3">
        <Button
          label={"Confirm and continue"}
          onClick={() => {
            setNextPage(true);
          }}
        />
      </div>
      <Button
        className="margin-top-1"
        variant="outline"
        label={"Edit information"}
        onClick={() => {
          setEditPage(true);
        }}
      />
    </>
  );

  return (
    <PatientTimeOfTestContainer currentPage={"profile"}>
      <PatientProfile patient={patient} />
      {buttonGroup}
    </PatientTimeOfTestContainer>
  );
};

export default connect()(PatientProfileContainer);
