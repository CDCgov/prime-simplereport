import { useEffect, useState, useRef } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import moment from "moment";
import { Trans, useTranslation } from "react-i18next";
import { validate as isValidUUID } from "uuid";

import Button from "../../app/commonComponents/Button/Button";
import { setTestResult, updateOrganization } from "../../app/store";
import { PxpApi } from "../PxpApiService";
import Alert from "../../app/commonComponents/Alert";
import { DateInput } from "../../app/commonComponents/DateInput";
import { dateFromStrings } from "../../app/utils/date";
import { LoadingCard } from "../../app/commonComponents/LoadingCard/LoadingCard";

const DOB = () => {
  const { t } = useTranslation();

  const plid = useSelector((state: any) => state.plid);

  useEffect(() => {
    PxpApi.getObfuscatedPatientName(plid)
      .then((name) => {
        setPatientObfuscatedName(name);
        setIsLoading(false);
      })
      .catch(() => {
        setLinkExpiredError(true);
      });
  }, [plid]);

  const dispatch = useDispatch();
  const [patientObfuscatedName, setPatientObfuscatedName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [birthDateError, setBirthDateError] = useState("");
  const [linkExpiredError, setLinkExpiredError] = useState(false);
  const [linkNotFoundError, setLinkNotFoundError] = useState(
    !isValidUUID(plid)
  );
  const dobRef = useRef<HTMLInputElement>(null);
  const testResult = useSelector((state: any) => state.testResult);
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
          name: response.organization.name,
        })
      );
      dispatch(setTestResult(response));
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

  if (testResult?.dateTested) {
    return (
      <Navigate
        to={{
          pathname: "/pxp/test-result",
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

  if (isLoading) {
    return <LoadingCard />;
  } else {
    return (
      <main>
        <div className="grid-container maxw-tablet">
          <h1 className="font-heading-lg margin-top-3">Verify date of birth</h1>
          <Trans t={t} i18nKey="testResult.dob.enterDOB2">
            <span className="text-bold">
              {{ personName: patientObfuscatedName }}
            </span>
          </Trans>
          <p className="usa-hint">
            <em>{t("testResult.dob.linkExpirationNotice")}</em>
          </p>
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
  }
};

export default connect()(DOB);
