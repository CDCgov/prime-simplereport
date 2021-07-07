import React, { FormEvent, useEffect, useState, useRef } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import moment from "moment";
import { useTranslation } from "react-i18next";

import Button from "../../app/commonComponents/Button/Button";
import TextInput from "../../app/commonComponents/TextInput";
import { setPatient, updateOrganization } from "../../app/store";
import { PxpApi } from "../PxpApiService";
import Alert from "../../app/commonComponents/Alert";

const DOB = () => {
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const [birthDate, setBirthDate] = useState("");
  const [birthDateError, setBirthDateError] = useState("");
  const [linkExpiredError, setLinkExpiredError] = useState(false);
  const dobRef = useRef<HTMLInputElement>(null);
  const plid = useSelector((state: any) => state.plid);
  const patient = useSelector((state: any) => state.patient);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dobRef?.current?.focus();
  }, []);

  const confirmBirthDate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const date = moment(birthDate.replace("/", ""), "MMDDYYYY");
    if (!date.isValid()) {
      setBirthDateError(t("testResult.dob.enterDOB"));
      dobRef?.current?.focus();
      return;
    }

    setLoading(true);
    try {
      const response = await PxpApi.validateDateOfBirth(
        plid,
        date.format("YYYY-MM-DD")
      );
      dispatch(
        updateOrganization({
          name: response.organizationName,
        })
      );
      dispatch(setPatient(response));
    } catch (error) {
      if (error?.status === 410) {
        setLinkExpiredError(true);
      } else {
        setBirthDateError(t("testResult.dob.error"));
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main>
        <div className="grid-container maxw-tablet">
          <p className="margin-top-3">{t("testResult.dob.validating")}</p>
        </div>
      </main>
    );
  }
  if (patient?.orderStatus === "COMPLETED") {
    return (
      <Redirect
        to={{
          pathname: "/test-result",
          search: `?plid=${plid}`,
        }}
      />
    );
  } else if (patient?.firstName) {
    return (
      <Redirect
        to={{
          pathname: "/patient-info-confirm",
          search: `?plid=${plid}`,
        }}
      />
    );
  }

  return (
    <>
      <main>
        <div className="grid-container maxw-tablet">
          {!linkExpiredError ? (
            <>
              <p className="margin-top-3">{t("testResult.dob.enterDOB2")}</p>
              <form className="usa-form" onSubmit={confirmBirthDate}>
                <TextInput
                  label={t("testResult.dob.dateOfBirth")}
                  name={"birthDate"}
                  type={"password"}
                  autoComplete={"on"}
                  value={birthDate}
                  size={8}
                  pattern={"([0-9]{1,2}/[0-9]{1,2}/[0-9]{4})|([0-9]{8})"}
                  inputMode={"numeric"}
                  ariaDescribedBy={"bdayFormat"}
                  hintText={"MM/DD/YYYY or MMDDYYYY"}
                  errorMessage={birthDateError}
                  validationStatus={birthDateError ? "error" : undefined}
                  onChange={(evt) => setBirthDate(evt.currentTarget.value)}
                  inputRef={dobRef}
                />
                <Button
                  id="dob-submit-button"
                  label={t("testResult.dob.submit")}
                  type={"submit"}
                />
              </form>
            </>
          ) : (
            <>
              <p></p>
              <Alert
                type="error"
                title="Link expired"
                body={t("testResult.dob.linkExpired")}
              />
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default connect()(DOB);
