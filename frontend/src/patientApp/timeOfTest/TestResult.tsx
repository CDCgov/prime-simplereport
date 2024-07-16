import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import React from "react";

import { formatFullName } from "../../app/utils/user";
import { RootState } from "../../app/store";
import { VerifyV2Response } from "../PxpApiService";
import { StaticTestResultModal } from "../../app/testResults/viewResults/actionMenuModals/TestResultPrintModal";
import Button from "../../app/commonComponents/Button/Button";
import ResultsGuidance from "../../app/commonComponents/TestResultGuidance/ResultsGuidance";
import TestResultsList from "../../app/commonComponents/TestResultsList";
import { formatDateWithTimeOption } from "../../app/utils/date";
import {
  getGuidanceForResults,
  hasMultipleResults,
} from "../../app/utils/testResults";
import "./TestResult.scss";
import { useDocumentTitle } from "../../app/utils/hooks";

const TestResult = () => {
  const { t } = useTranslation();

  useDocumentTitle(t("testResult.title"));

  const testResult = useSelector<RootState, VerifyV2Response>(
    (state) => state.testResult
  );
  const fullName = formatFullName(testResult?.patient as any);
  const dateTested = formatDateWithTimeOption(testResult?.dateTested, true);
  const deviceType = testResult?.deviceType.name;
  const isPatientApp = true;
  const guidance = getGuidanceForResults(testResult.results, isPatientApp);

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

      <div
        className="patient-app padding-top-105 padding-bottom-4 bg-base-lightest"
        data-testid="patient-app"
      >
        <div className="grid-container maxw-tablet">
          <div className="card usa-prose">
            <h1 className="font-heading-lg">
              {hasMultipleResults(testResult.results)
                ? t("testResult.multipleResultHeader")
                : t("testResult.singleResultHeader")}
            </h1>
            <Button
              className="usa-button--unstyled"
              label={t("testResult.downloadResult")}
              onClick={() => window.print()}
            />
            {}
            <div className="grid-row margin-top-105">
              <div className="grid-col">
                <h2 className="font-heading-sm margin-0">
                  {t("testResult.patient")}
                </h2>
                <p className="margin-top-0">{fullName}</p>
              </div>
              <div className="grid-col usa-prose">
                <h2 className="font-heading-sm">{t("testResult.testDate")}</h2>
                <p className="margin-top-05">{dateTested}</p>
              </div>
            </div>

            <div className="grid-row">
              <div className="grid-col usa-prose">
                <TestResultsList
                  results={testResult.results}
                  isPatientApp={isPatientApp}
                />
              </div>
            </div>
            <h2 className="font-heading-sm">{t("testResult.testDevice")}</h2>
            <p className="margin-top-05">{deviceType}</p>
            {guidance.length && (
              <>
                <h2 className="font-heading-sm">
                  {t("testResult.moreInformation")}
                </h2>
                <ResultsGuidance
                  guidance={guidance}
                  isPatientApp={isPatientApp}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestResult;
