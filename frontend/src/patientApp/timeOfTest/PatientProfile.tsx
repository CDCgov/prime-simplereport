import moment from "moment";

import { formatFullName } from "../../app/utils/user";
import {
  RACE_VALUES,
  ETHNICITY_VALUES,
  GENDER_VALUES,
} from "../../app/constants";

import Button from "../../app/commonComponents/Button";
import React, { useState } from "react";
import { Redirect } from "react-router";

interface Props {
  patient: any;
}

const PatientProfile = (props: Props) => {
  const [nextPage, setNextPage] = useState(false);

  const fullName = formatFullName(props.patient);
  const race = RACE_VALUES.find((val) => val.value === props.patient.race)
    ?.label;
  const ethnicity = ETHNICITY_VALUES.find(
    (val) => val.value === props.patient.ethnicity
  )?.label;
  const gender = GENDER_VALUES.find((val) => val.value === props.patient.gender)
    ?.label;

  const formattedAddress = () => {
    const lastAddressLine = `${props.patient.city}${
      props.patient.state && props.patient.city ? "," : ""
    }${props.patient.city ? " " : ""}${props.patient.state}${
      props.patient.state ? " " : ""
    }${props.patient.zipCode}`;

    let result = props.patient.street;
    result += `${
      result.length > 0
        ? "\n" + props.patient.streetTwo
        : props.patient.streetTwo
    }`;
    result += `${result.length > 0 ? "\n" + lastAddressLine : lastAddressLine}`;
    return result;
  };

  const newLineSpan = ({ text = "" }) => {
    return text
      .split("\n")
      .map((str) => <span className="display-block">{str}</span>);
  };

  const capitalize = ({ text = "" }) => {
    const answer = text.toLowerCase();
    return answer.charAt(0).toUpperCase() + answer.slice(1);
  };

  const address = formattedAddress();
  const notProvided = "Not provided";

  const savePatientAnswers = () => {
    setNextPage(true);
  };

  const buttonGroup = (
    <div className="margin-top-3">
      <Button label="Confirm and continue" onClick={savePatientAnswers} />
    </div>
  );

  if (nextPage) {
    return (
      <Redirect
        push
        to={{
          pathname: "/patient-info-confirmation",
          state: { page: "symptoms" },
        }}
      />
    );
  }

  return (
    <>
      <div className="usa-alert usa-alert--info margin-bottom-3">
        <div className="usa-alert__body">
          <p className="usa-alert__text">
            Confirm that your profile info is correct. If it’s incorrect, tell
            the test administrator.
          </p>
        </div>
      </div>
      <div className="prime-formgroup usa-prose">
        <h2 className="prime-formgroup-heading font-heading-lg">
          General information
        </h2>
        <h3 className="font-heading-sm">Name</h3>
        <p>{fullName}</p>
        <h3 className="font-heading-sm">Date of birth</h3>
        <p>
          {props.patient.birthDate
            ? moment(props.patient.birthDate).format("MM/DD/yyyy")
            : notProvided}
        </p>
        <h3 className="font-heading-sm">Phone number</h3>
        <p>{props.patient.telephone || notProvided}</p>
        {/* <h3 className="font-heading-sm">Phone type</h3>
        <p></p> */}
        <h3 className="font-heading-sm">Address</h3>
        <p>{address ? newLineSpan({ text: address }) : notProvided}</p>
        <h3 className="font-heading-sm">Email address</h3>
        <p>{props.patient.email || notProvided}</p>
        <h2 className="prime-formgroup-heading font-heading-lg">
          Demographics
        </h2>
        <h3 className="font-heading-sm">Race</h3>
        <p>{race || notProvided}</p>
        {/* <h3 className="font-heading-sm">Tribal affiliation</h3>
        <p></p> */}
        <h3 className="font-heading-sm">Ethnicity</h3>
        <p>{ethnicity || notProvided}</p>
        <h3 className="font-heading-sm">Biological sex</h3>
        <p>{gender || notProvided}</p>
        <h2 className="prime-formgroup-heading font-heading-lg">Other</h2>
        <h3 className="font-heading-sm">
          Resident in congregate care/living setting
        </h3>
        <p>
          {props.patient.residentCongregateSetting
            ? capitalize({ text: props.patient.residentCongregateSetting })
            : notProvided}
        </p>
        <h3 className="font-heading-sm">Employed in healthcare</h3>
        <p>
          {props.patient.employedInHealthcare
            ? capitalize({ text: props.patient.employedInHealthcare })
            : notProvided}
        </p>
      </div>
      {buttonGroup}
    </>
  );
};

export default PatientProfile;
