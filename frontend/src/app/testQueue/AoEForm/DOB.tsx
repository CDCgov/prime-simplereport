import React from "react";
import { useState } from "react";
import moment from "moment";

import Button from "../../commonComponents/Button";
import TextInput from "../../commonComponents/TextInput";

const DOB = () => {
  const [birthDateResponse, setBirthDateResponse] = useState('');
  const [birthDateError, setBirthDateError] = useState('');

  const isValidForm = () => {
    const validDate = moment(birthDateResponse.replace('/', ''), "MMDDDYYYY").isValid();

    if (validDate) {
      setBirthDateError('');
      return true;
    } else {
      setBirthDateError('Enter your date of birth');
      return false;
    }
  }

  const confirmBirthDate = () => {
    if (isValidForm()) {
      console.log("saved")
    }
  };

  return (
    <>
      <main>
        <div className="grid-container maxw-tablet">
          <p className="margin-top-3">
            Enter your date of birth to access your COVID-19 Testing Portal.
          </p>
          <form
            className="usa-form"
            onSubmit={(e) => {
              e.preventDefault();
              confirmBirthDate();
            }}
          >
            <TextInput
              label={"Date of birth"}
              name={"birthDate"}
              type={"bday"}
              required={true}
              autoComplete={"bday"}
              value={birthDateResponse}
              size={8}
              pattern={"([0-9]{1,2}/[0-9]{1,2}/[0-9]{4})|([0-9]{8})"}
              inputMode={"numeric"}
              ariaDescribedBy={"bdayFormat"}
              hintText={"MM/DD/YYYY or MMDDYYYY"}
              errorMessage={birthDateError}
              validationStatus={birthDateError ? "error" : undefined}
              onChange={(evt) => setBirthDateResponse(evt.currentTarget.value)}
            />
            <Button label={"Continue"} type={"submit"} />
          </form>
        </div>
      </main>
    </>
  );
};

export default DOB;
