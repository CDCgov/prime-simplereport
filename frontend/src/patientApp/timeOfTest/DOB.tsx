import React, { useEffect, useState, useRef } from "react";
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
import {
  dateFromStrings,
  formatLongDateWithTimeOption,
} from "../../app/utils/date";
import { LoadingCard } from "../../app/commonComponents/LoadingCard/LoadingCard";
import { formatPhoneNumberParens } from "../../app/utils/text";
import { useDocumentTitle } from "../../app/utils/hooks";

const DOB = () => {
  const { t } = useTranslation();

  useDocumentTitle(t("testResult.dob.title"));

  const plid = useSelector((state: any) => state.plid);

  useEffect(() => {
    PxpApi.getTestResultUnauthenticated(plid)
      .then((response) => {
        setPatientObfuscatedName(
          `${response.patient.firstName} ${response.patient.lastName}`
        );
        setFacility(response.facility);
        setExpiresAt(response.expiresAt);
        setIsLoading(false);
      })
      .catch(() => {
        setLinkExpiredError(true);
      });
  }, [plid]);

  const dispatch = useDispatch();
  const [patientObfuscatedName, setPatientObfuscatedName] = useState("");
  const [facility, setFacility] = useState<Pick<
    Facility,
    "name" | "phone"
  > | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
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
      <div className="grid-container maxw-tablet">
        <p className="margin-top-3">{t("testResult.dob.validating")}</p>
      </div>
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
      <div className="grid-container maxw-tablet">
        <p></p>
        <Alert
          type="error"
          title="Link expired"
          body={t("testResult.dob.linkExpired")}
        />
      </div>
    );
  }

  if (linkNotFoundError) {
    return (
      <div className="grid-container maxw-tablet">
        <p></p>
        <Alert
          type="error"
          title="Page not found"
          body={t("testResult.dob.linkNotFound")}
        />
      </div>
    );
  }

  if (isLoading) {
    return <LoadingCard />;
  } else {
    return (
      <div className={"prime-home flex-1"}>
        <div className="grid-container maxw-tablet">
          <div className="prime-container card-container margin-top-2">
            <div className="usa-card__header">
              <h1 className="font-sans-lg">{t("testResult.dob.header")}</h1>
            </div>
            <div className="prime-container padding-3">
              <Trans t={t} parent="p" i18nKey="testResult.dob.enterDOB2">
                <span className="text-bold">
                  {{ personName: patientObfuscatedName }}
                </span>
              </Trans>
              <p className="usa-hint font-ui-2xs">
                <em>
                  <Trans t={t} i18nKey="testResult.dob.linkExpirationNotice">
                    {{
                      expirationDate: formatLongDateWithTimeOption(
                        expiresAt,
                        true
                      ),
                    }}
                  </Trans>
                  <Trans t={t} i18nKey="testResult.dob.testingFacilityContact">
                    {{ facilityName: facility?.name }}
                    {facility?.phone && (
                      <span style={{ whiteSpace: "nowrap" }}>
                        {{
                          facilityPhone:
                            "at " +
                            formatPhoneNumberParens(facility?.phone as string),
                        }}
                      </span>
                    )}
                  </Trans>
                </em>
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
                monthOnChange={(evt: any) =>
                  setBirthMonth(evt.currentTarget.value)
                }
                dayOnChange={(evt: any) => setBirthDay(evt.currentTarget.value)}
                yearOnChange={(evt: any) =>
                  setBirthYear(evt.currentTarget.value)
                }
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
          </div>
        </div>
      </div>
    );
  }
};

export default connect()(DOB);
