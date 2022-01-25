import { useSelector } from "react-redux";
import { Trans, useTranslation } from "react-i18next";
import React from "react";

import { formatFullName } from "../../app/utils/user";
import { RootState } from "../../app/store";
import { TestResult as TestResultType } from "../../app/testQueue/QueueItem";
import { COVID_RESULTS } from "../../app/constants";
import { VerifyV2Response } from "../PxpApiService";
import { StaticTestResultModal } from "../../app/testResults/TestResultPrintModal";
import Button from "../../app/commonComponents/Button/Button";
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
            <TestResultNotes result={testResult.result} />
            <Trans
              t={t}
              parent="p"
              i18nKey="testResult.information"
              components={[
                <a href="https://www.cdc.gov/coronavirus/2019-ncov/if-you-are-sick/end-home-isolation.html">
                  Centers for Disease Control and Prevention (CDC) website
                </a>,
              ]}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

interface TestResultNotesProps {
  result: TestResultType;
}

const TestResultNotes: React.FC<TestResultNotesProps> = (props) => {
  const { t } = useTranslation();

  switch (props.result) {
    case COVID_RESULTS.POSITIVE:
      return (
        <>
          <p>{t("testResult.notes.positive.p1")}</p>
          <ul>
            <li>{t("testResult.notes.positive.guidelines.li0")}</li>
            <li>{t("testResult.notes.positive.guidelines.li1")}</li>
            <li>{t("testResult.notes.positive.guidelines.li2")}</li>
            <li>{t("testResult.notes.positive.guidelines.li3")}</li>
            <li>{t("testResult.notes.positive.guidelines.li4")}</li>
            <li>{t("testResult.notes.positive.guidelines.li5")}</li>
          </ul>
          <Trans
            t={t}
            parent="p"
            i18nKey="testResult.notes.positive.p2"
            components={[
              <a href="https://www.cdc.gov/coronavirus/2019-ncov/symptoms-testing/symptoms.html">
                Watch for symptoms and learn when to seek emergency medical
                attention
              </a>,
            ]}
          />
          <ul>
            <li>{t("testResult.notes.positive.emergency.li0")}</li>
            <li>{t("testResult.notes.positive.emergency.li1")}</li>
            <li>{t("testResult.notes.positive.emergency.li2")}</li>
            <li>{t("testResult.notes.positive.emergency.li3")}</li>
            <li>{t("testResult.notes.positive.emergency.li4")}</li>
          </ul>
          <p>{t("testResult.notes.positive.p3")}</p>
          <Trans
            t={t}
            parent="p"
            i18nKey="testResult.notes.positive.difficultNewsLink"
            components={[
              <a href="https://www.cdc.gov/coronavirus/2019-ncov/daily-life-coping/managing-stress-anxiety.html">
                take steps to cope with stress
              </a>,
            ]}
          />
        </>
      );
    case COVID_RESULTS.NEGATIVE:
      return (
        <>
          <p>{t("testResult.notes.negative.p0")}</p>
          <ul>
            <li>{t("testResult.notes.negative.symptoms.li0")}</li>
            <li>{t("testResult.notes.negative.symptoms.li1")}</li>
            <li>{t("testResult.notes.negative.symptoms.li2")}</li>
            <li>{t("testResult.notes.negative.symptoms.li3")}</li>
            <li>{t("testResult.notes.negative.symptoms.li4")}</li>
            <li>{t("testResult.notes.negative.symptoms.li5")}</li>
            <li>{t("testResult.notes.negative.symptoms.li6")}</li>
            <li>{t("testResult.notes.negative.symptoms.li7")}</li>
            <li>{t("testResult.notes.negative.symptoms.li8")}</li>
            <li>{t("testResult.notes.negative.symptoms.li9")}</li>
            <li>{t("testResult.notes.negative.symptoms.li10")}</li>
          </ul>
        </>
      );
    default:
      return (
        <>
          <p>{t("testResult.notes.inconclusive.p0")}</p>
          <p>{t("testResult.notes.inconclusive.p1")}</p>
        </>
      );
  }
};

export default TestResult;
