import { useEffect, useState, useRef } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { validate as isValidUUID } from "uuid";

import Button from "../../app/commonComponents/Button/Button";
import { setPatient, updateOrganization } from "../../app/store";
import { PxpApi } from "../PxpApiService";
import Alert from "../../app/commonComponents/Alert";
import { DateInput } from "../../app/commonComponents/DateInput";
import { dateFromStrings } from "../../app/utils/date";

const DOB = () => {
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const plid = useSelector((state: any) => state.plid);
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [birthDateError, setBirthDateError] = useState("");
  const [linkExpiredError, setLinkExpiredError] = useState(false);
  const [linkNotFoundError, setLinkNotFoundError] = useState(
    !isValidUUID(plid)
  );
  const dobRef = useRef<HTMLInputElement>(null);
  const patient = useSelector((state: any) => state.patient);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dobRef?.current?.focus();
  }, []);

  const validateBirthDate = () => {
    const date = dateFromStrings(birthMonth, birthDay, birthYear);
    if (date.year() < 1900 || date.year() > moment().year()) {
      setBirthDateError(t("testResult.dob.invalidYear"));
      dobRef?.current?.focus();
      return false;
    } else if (!date.isValid()) {
      setBirthDateError(t("testResult.dob.invalidDate"));
      dobRef?.current?.focus();
      return false;
    } else {
      setBirthDateError("");
      return true;
    }
  };

  const confirmBirthDate = async () => {
    if (!validateBirthDate()) {
      return;
    }

    const date = dateFromStrings(birthMonth, birthDay, birthYear);
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
    } catch (error: any) {
      let strError = String(error);
      if (error?.status === 410 || strError.includes("410")) {
        setLinkExpiredError(true);
      } else if (error?.status === 404 || strError.includes("404")) {
        setLinkNotFoundError(true);
      } else if (
        error?.status === 403 ||
        error?.status === 401 ||
        strError.includes("403") ||
        strError.includes("401")
      ) {
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

  if (linkExpiredError) {
    return (
      <main>
        <div className="grid-container maxw-tablet">
          <p></p>
          <Alert
            type="error"
            title="Link expired"
            body={t("testResult.dob.linkExpired")}
          />
        </div>
      </main>
    );
  }

  if (linkNotFoundError) {
    return (
      <main>
        <div className="grid-container maxw-tablet">
          <p></p>
          <Alert
            type="error"
            title="Page not found"
            body={t("testResult.dob.linkNotFound")}
          />
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="grid-container maxw-tablet">
        <p className="margin-top-3">{t("testResult.dob.enterDOB2")}</p>
        <p>{t("testResult.dob.linkExpirationNotice")}</p>
        <DateInput
          className="width-mobile"
          label={t("testResult.dob.dateOfBirth")}
          name={"birthDate"}
          monthName={"birthMonth"}
          dayName={"birthDay"}
          yearName={"birthYear"}
          monthValue={birthMonth}
          dayValue={birthDay}
          yearValue={birthYear}
          monthOnChange={(evt: any) => setBirthMonth(evt.currentTarget.value)}
          dayOnChange={(evt: any) => setBirthDay(evt.currentTarget.value)}
          yearOnChange={(evt: any) => setBirthYear(evt.currentTarget.value)}
          errorMessage={birthDateError}
          validationStatus={birthDateError ? "error" : undefined}
        />
        <Button
          className="margin-top-2"
          id="dob-submit-button"
          data-testid="dob-submit-button"
          label={t("testResult.dob.submit")}
          onClick={confirmBirthDate}
        />
      </div>
    </main>
  );
};

export default connect()(DOB);
