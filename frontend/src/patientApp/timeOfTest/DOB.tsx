import React, { FormEvent, useEffect, useState, useRef } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import moment from "moment";

import Button from "../../app/commonComponents/Button";
import TextInput from "../../app/commonComponents/TextInput";
import { setPatient, updateOrganization } from "../../app/store";
import { PxpApi } from "../PxpApiService";

const DOB = () => {
  const dispatch = useDispatch();
  const [birthDate, setBirthDate] = useState("");
  const [birthDateError, setBirthDateError] = useState("");
  const dobRef = useRef<HTMLInputElement>(null);
  const plid = useSelector((state: any) => state.plid);
  const patient = useSelector((state: any) => state.patient);
  const [loading, setLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState("");

  useEffect(() => {
    dobRef?.current?.focus();
  }, []);

  const confirmBirthDate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const date = moment(birthDate.replace("/", ""), "MMDDYYYY");
    if (!date.isValid()) {
      setBirthDateError("Enter your date of birth");
      dobRef?.current?.focus();
      return;
    }

    setLoading(true);
    try {
      const response = await PxpApi.validateDateOfBirth(
        plid,
        date.format("YYYY-MM-DD")
      );
      const residentCongregateSetting = response.residentCongregateSetting
        ? "YES"
        : "NO";
      const employedInHealthcare = response.employedInHealthcare ? "YES" : "NO";
      dispatch(
        updateOrganization({
          name: response.organizationName,
        })
      );
      dispatch(
        setPatient({
          ...response,
          residentCongregateSetting,
          employedInHealthcare,
        })
      );
      setOrderStatus(response.orderStatus);
    } catch (error) {
      setBirthDateError(
        "No patient link with the supplied ID was found, or the birth date provided was incorrect."
      );
    } finally {
      setLoading(false);
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
  if (orderStatus === "COMPLETED") {
    return (
      <Redirect
        push
        to={{
          pathname: "/test-result",
          search: `?plid=${plid}`,
        }}
      />
    );
  } else if (patient) {
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
