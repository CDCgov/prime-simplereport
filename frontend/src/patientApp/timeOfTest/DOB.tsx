import React, { useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import moment from "moment";

import Button from "../../app/commonComponents/Button";
import TextInput from "../../app/commonComponents/TextInput";
import { setPatient } from "../../app/store";
import { PxpApi } from "../PxpApiService";

const DOB = () => {
  const dispatch = useDispatch();
  const [birthDate, setBirthDate] = useState("");
  const [birthDateError, setBirthDateError] = useState("");
  const [nextPage, setNextPage] = useState(false);
  const dobRef = React.createRef() as any;
  const plid = useSelector((state) => (state as any).plid as String);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(undefined as any);

  useEffect(() => {
    if (!data) return;
    const patient = data;
    const residentCongregateSetting = patient.residentCongregateSetting
      ? "YES"
      : "NO";
    const employedInHealthcare = patient.employedInHealthcare ? "YES" : "NO";

    dispatch(
      setPatient({
        ...patient,
        residentCongregateSetting,
        employedInHealthcare,
      })
    );

    setNextPage(true);
    // eslint-disable-next-line
  }, [data]);

  const isValidForm = () => {
    const validDate = moment(birthDate.replace("/", ""), "MMDDYYYY").isValid();

    if (validDate) {
      setBirthDateError("");
      return true;
    } else {
      dobRef.current.focus();
      setBirthDateError("Enter your date of birth");
      return false;
    }
  };

  const confirmBirthDate = () => {
    if (isValidForm()) {
      const dob = moment(birthDate.replace("/", ""), "MMDDYYYY").format(
        "YYYY-MM-DD"
      );
      setLoading(true);
      PxpApi.validateDob(plid, dob).then((result) => {
        setData(result);
        setLoading(false);
      });
    }
  };

  if (loading) {
    return (
      <main>
        <div className="grid-container maxw-tablet">
          <p className="margin-top-3">Validating birth date...</p>
        </div>
      </main>
    );
  }

  if (nextPage) {
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
    <>
      <main>
        <div className="grid-container maxw-tablet">
          <p className="margin-top-3">
            Enter your date of birth to access your COVID-19 Testing Portal.
          </p>
          <form className="usa-form" onSubmit={confirmBirthDate}>
            <TextInput
              label={"Date of birth"}
              name={"birthDate"}
              type={"bday"}
              autoComplete={"bday"}
              value={birthDate}
              size={8}
              pattern={"([0-9]{1,2}/[0-9]{1,2}/[0-9]{4})|([0-9]{8})"}
              inputMode={"numeric"}
              ariaDescribedBy={"bdayFormat"}
              hintText={"MM/DD/YYYY or MMDDYYYY"}
              errorMessage={birthDateError}
              hideOptional={true}
              validationStatus={birthDateError ? "error" : undefined}
              onChange={(evt) => setBirthDate(evt.currentTarget.value)}
              inputRef={dobRef}
            />
            <Button id="dob-submit-button" label={"Continue"} type={"submit"} />
          </form>
        </div>
      </main>
    </>
  );
};

export default connect()(DOB);
