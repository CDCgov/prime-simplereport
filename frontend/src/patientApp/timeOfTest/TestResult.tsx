import { useSelector } from "react-redux";
import { Trans, useTranslation } from "react-i18next";
import React from "react";

import { formatFullName } from "../../app/utils/user";
import { RootState } from "../../app/store";
import { VerifyV2Response } from "../PxpApiService";
import { StaticTestResultModal } from "../../app/testResults/TestResultPrintModal";
import Button from "../../app/commonComponents/Button/Button";
import CovidResultGuidance from "../../app/commonComponents/CovidResultGuidance";
import { formatDateWithTimeOption } from "../../app/utils/date";

import "./TestResult.scss";

const TestResult = () => {
  const { t } = useTranslation();
  const testResult = useSelector<RootState, VerifyV2Response>(
    (state) => state.testResult
  );
  const fullName = formatFullName(testResult?.patient as any);
  const dateTested = formatDateWithTimeOption(testResult?.dateTested, true);
  const deviceType = testResult?.deviceType.name;

  return (
    <div className="pxp-test-results">
      <div id="section-to-print">
        <div className="print-area">
          <StaticTestResultModal
            testResultId={testResult.testEventId}
            testResult={testResult}
          />
        </div>
      </div>

      <main
        className="patient-app padding-top-105 padding-bottom-4 bg-base-lightest"
        data-testid="patient-app"
      >
        <div className="grid-container maxw-tablet">
          <div className="card usa-prose">
            <h1 className="font-heading-lg">{t("testResult.result")}</h1>
            <Button
              className="usa-button--unstyled"
              label={t("testResult.downloadResult")}
              onClick={() => window.print()}
            />

            <h2 className="font-heading-sm">{t("testResult.patient")}</h2>
            <p className="margin-top-05">{fullName}</p>
            <div className="grid-row">
              <div className="grid-col usa-prose">
                <h2 className="font-heading-sm">
                  {t("testResult.testResult")}
                </h2>
                <p className="margin-top-05">
                  {(() => {
                    switch (testResult.result) {
                      case "POSITIVE":
                        return t("testResult.positive");
                      case "NEGATIVE":
                        return t("testResult.negative");
                      case "UNDETERMINED":
                        return t("testResult.undetermined");
                      case "UNKNOWN":
                      default:
                        return t("testResult.unknown");
                    }
                  })()}
                </p>
              </div>
              <div className="grid-col usa-prose">
                <h2 className="font-heading-sm">{t("testResult.testDate")}</h2>
                <p className="margin-top-05">{dateTested}</p>
              </div>
            </div>
            <h2 className="font-heading-sm">{t("testResult.testDevice")}</h2>
            <p className="margin-top-05">{deviceType}</p>
            <h2 className="font-heading-sm">{t("testResult.meaning")}</h2>
            <CovidResultGuidance
              result={testResult.result}
              isPatientApp={true}
            />
            <Trans
              t={t}
              parent="p"
              i18nKey="testResult.information"
              components={[
                <a
                  href={t("testResult.cdcLink")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  cdc.gov
                </a>,
                <a
                  href={t("testResult.countyCheckToolLink")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  county check tool
                </a>,
              ]}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default TestResult;
