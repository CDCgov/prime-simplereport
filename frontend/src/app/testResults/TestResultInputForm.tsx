import React from "react";

import RadioGroup from "../commonComponents/RadioGroup";
import Button from "../commonComponents/Button/Button";
import { COVID_RESULTS, TEST_RESULT_DESCRIPTIONS } from "../constants";
import { TestResult } from "../testQueue/QueueItem";
import Checkboxes from "../commonComponents/Checkboxes";
import { TextWithTooltip } from "../commonComponents/TextWithTooltip";

interface Props {
  queueItemId: string;
  covidResult: TestResult | undefined;
  fluAResult?: TestResult | undefined;
  fluBResult?: TestResult | undefined;
  supportsMultipleDiseases: boolean;
  isSubmitDisabled?: boolean;
  onTestResultChange: (
    diseaseName: string
  ) => (value: TestResult | undefined) => void;
  onSubmit: () => void;
}

const TestResultInputForm: React.FC<Props> = ({
  queueItemId,
  covidResult,
  fluAResult,
  fluBResult,
  supportsMultipleDiseases,
  isSubmitDisabled,
  onSubmit,
  onTestResultChange,
}) => {
  const onCovidResultClick = (value: TestResult) => {
    if (value === covidResult) {
      onTestResultChange("COVID-19")(undefined);
    }
  };

  const onFluAResultClick = (value: TestResult) => {
    if (value === fluAResult) {
      onTestResultChange("Flu A")(undefined);
    }
  };

  const onFluBResultClick = (value: TestResult) => {
    if (value === fluBResult) {
      onTestResultChange("Flu B")(undefined);
    }
  };

  const onInconclusiveResultClick = () => {
    if (
      covidResult === COVID_RESULTS.INCONCLUSIVE &&
      fluAResult === COVID_RESULTS.INCONCLUSIVE &&
      fluBResult === COVID_RESULTS.INCONCLUSIVE
    ) {
      onTestResultChange("COVID-19")(undefined);
      onTestResultChange("Flu A")(undefined);
      onTestResultChange("Flu B")(undefined);
    } else {
      onTestResultChange("COVID-19")(COVID_RESULTS.INCONCLUSIVE);
      onTestResultChange("Flu A")(COVID_RESULTS.INCONCLUSIVE);
      onTestResultChange("Flu B")(COVID_RESULTS.INCONCLUSIVE);
    }
  };

  const allowSubmit =
    covidResult &&
    covidResult !== "UNKNOWN" &&
    (supportsMultipleDiseases
      ? fluAResult &&
        fluAResult !== "UNKNOWN" &&
        fluBResult &&
        fluBResult !== "UNKNOWN"
      : true) &&
    !isSubmitDisabled;

  const onResultSubmit = (event: React.FormEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (allowSubmit) {
      onSubmit();
    }
  };

  return (
    <form className="usa-form maxw-none">
      <>
        {supportsMultipleDiseases ? (
          <div className="grid-row">
            <div className="grid-col-4">
              <h4 className="prime-radio__title">COVID-19</h4>
              <RadioGroup
                legend="COVID-19 result"
                legendSrOnly
                onClick={onCovidResultClick}
                onChange={onTestResultChange("COVID-19")}
                buttons={[
                  {
                    value: COVID_RESULTS.POSITIVE,
                    label: `${TEST_RESULT_DESCRIPTIONS.POSITIVE} (+)`,
                  },
                  {
                    value: COVID_RESULTS.NEGATIVE,
                    label: `${TEST_RESULT_DESCRIPTIONS.NEGATIVE} (-)`,
                  },
                ]}
                name={`covid-test-result-${queueItemId}`}
                selectedRadio={covidResult}
                wrapperClassName="prime-radio__group"
              />
            </div>
            <div className="grid-col-4">
              <h4 className="prime-radio__title">Flu A</h4>
              <RadioGroup
                legend="Flu A result"
                legendSrOnly
                onClick={onFluAResultClick}
                onChange={onTestResultChange("Flu A")}
                buttons={[
                  {
                    value: COVID_RESULTS.POSITIVE,
                    label: `${TEST_RESULT_DESCRIPTIONS.POSITIVE} (+)`,
                  },
                  {
                    value: COVID_RESULTS.NEGATIVE,
                    label: `${TEST_RESULT_DESCRIPTIONS.NEGATIVE} (-)`,
                  },
                ]}
                name={`flu-a-test-result-${queueItemId}`}
                selectedRadio={fluAResult}
                wrapperClassName="prime-radio__group"
              />
            </div>
            <div className="grid-col-4">
              <h4 className="prime-radio__title">Flu B</h4>
              <RadioGroup
                legend="Flu B result"
                legendSrOnly
                onClick={onFluBResultClick}
                onChange={onTestResultChange("Flu B")}
                buttons={[
                  {
                    value: COVID_RESULTS.POSITIVE,
                    label: `${TEST_RESULT_DESCRIPTIONS.POSITIVE} (+)`,
                  },
                  {
                    value: COVID_RESULTS.NEGATIVE,
                    label: `${TEST_RESULT_DESCRIPTIONS.NEGATIVE} (-)`,
                  },
                ]}
                name={`flu-b-test-result-${queueItemId}`}
                selectedRadio={fluBResult}
                wrapperClassName="prime-radio__group"
              />
            </div>
          </div>
        ) : (
          <>
            <h4 className="prime-radio__title">COVID-19 results</h4>
            <RadioGroup
              legend="Test result"
              legendSrOnly
              onClick={onCovidResultClick}
              onChange={onTestResultChange("COVID-19")}
              buttons={[
                {
                  value: COVID_RESULTS.POSITIVE,
                  label: `${TEST_RESULT_DESCRIPTIONS.POSITIVE} (+)`,
                },
                {
                  value: COVID_RESULTS.NEGATIVE,
                  label: `${TEST_RESULT_DESCRIPTIONS.NEGATIVE} (-)`,
                },
                {
                  value: COVID_RESULTS.INCONCLUSIVE,
                  label: `${TEST_RESULT_DESCRIPTIONS.UNDETERMINED}`,
                },
              ]}
              name={`covid-test-result-${queueItemId}`}
              selectedRadio={covidResult}
              wrapperClassName="prime-radio__group"
            />
          </>
        )}
        <div
          className={
            supportsMultipleDiseases
              ? "prime-multiplex-result-submit"
              : "prime-test-result-submit"
          }
        >
          {supportsMultipleDiseases && (
            <>
              <Checkboxes
                onChange={onInconclusiveResultClick}
                legend="Inconclusive tests"
                legendSrOnly
                name="inconclusive-tests"
                boxes={[
                  {
                    value: "inconclusive",
                    label: "Mark test as inconclusive",
                    checked:
                      covidResult === COVID_RESULTS.INCONCLUSIVE &&
                      fluAResult === COVID_RESULTS.INCONCLUSIVE &&
                      fluBResult === COVID_RESULTS.INCONCLUSIVE,
                  },
                ]}
              />
              <TextWithTooltip
                className="float-right"
                tooltip="COVID-19 results are reported to your public health department. Flu results are not reported at this time."
                position="left"
              />
            </>
          )}
          <Button
            onClick={onResultSubmit}
            type="submit"
            disabled={!allowSubmit}
            variant="outline"
            label="Submit"
          />
        </div>
      </>
    </form>
  );
};

export default TestResultInputForm;
