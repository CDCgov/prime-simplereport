import React from "react";
import moment from "moment";
import { Icon, Label, Radio, Textarea } from "@trussworks/react-uswds";

import TextInput from "../commonComponents/TextInput";
import RadioGroup, { RadioGroupOptions } from "../commonComponents/RadioGroup";
import { TEST_RESULTS } from "../testResults/constants";
import { formatDate } from "../utils/date";
import "./TestDetailSection.scss";
import { ResultScaleType } from "../../generated/graphql";
import Button from "../commonComponents/Button/Button";

import {
  ResultScaleTypeOptions,
  useFilteredTestOrderLoincListQueryStub,
} from "./LabReportFormUtils";
import { TestDetailsInputKeyed } from "./LabReportForm";

type TestDetailSectionProps = {
  testDetails: TestDetailsInputKeyed;
  updateTestDetails: (details: TestDetailsInputKeyed) => void;
  selectedConditions: string[];
  selectedSpecimen: string;
  removeTest: (key: string) => void;
};

const ordinalResultButtons: RadioGroupOptions<string> = [
  {
    value: TEST_RESULTS.POSITIVE,
    label: `Positive (+)`,
  },
  {
    value: TEST_RESULTS.NEGATIVE,
    label: `Negative (-)`,
  },
  {
    value: TEST_RESULTS.UNDETERMINED,
    label: `Undetermined`,
  },
];

const TestDetailSection = ({
  testDetails,
  updateTestDetails,
  selectedConditions,
  selectedSpecimen,
  removeTest,
}: TestDetailSectionProps) => {
  const testOrderLoincList = useFilteredTestOrderLoincListQueryStub(
    selectedConditions,
    selectedSpecimen
  );

  return (
    <>
      <div className="grid-row grid-gap flex-justify">
        <div className="grid-col-auto">
          <h3 className={"font-sans-md"}>
            {testDetails.condition} Test Details
          </h3>
        </div>
        <div className="grid-col-auto text-gray-70">
          <Button
            type={"button"}
            variant={"unstyled"}
            onClick={() => removeTest(testDetails.key)}
            className={"margin-top-105"}
          >
            <Icon.Close size={3} focusable={true} role={"presentation"} />
          </Button>
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="grid-col-auto">
          <fieldset className={"usa-fieldset"}>
            <legend className="usa-legend">Select the test ordered</legend>
            {/* currently this causes extra white space at the bottom due to the page scroll wheel thinking there is extra content where the additional radio buttons would be if not contained in the inner scroll */}
            <div className="loinc-radio-group">
              {testOrderLoincList.map((loinc) => {
                return (
                  <Radio
                    id={`test-order-loinc-${loinc.code}`}
                    name={`input-test-order-loinc-${testDetails.key}`}
                    label={loinc.title}
                    labelDescription={loinc.description}
                    value={loinc.code}
                    checked={loinc.code === testDetails.loincCode}
                    onChange={() =>
                      updateTestDetails({
                        ...testDetails,
                        loincCode: loinc.code,
                        loincShortName: loinc.title,
                      })
                    }
                    tile={true}
                  />
                );
              })}
            </div>
          </fieldset>
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="grid-col-auto">
          <TextInput
            name={`test-detail-${testDetails.key}-test-result-date`}
            type="date"
            label="Test result date"
            min={formatDate(new Date("Jan 1, 2020"))}
            max={formatDate(moment().toDate())}
            value={formatDate(moment(testDetails.resultDate).toDate())}
            onChange={(e) => {
              updateTestDetails({
                ...testDetails,
                resultDate: e.target.value,
              });
            }}
          ></TextInput>
        </div>
        <div className="grid-col-auto">
          <TextInput
            name={`test-detail-${testDetails.key}-test-result-time`}
            type="time"
            label="Test result time"
            step="60"
            value={testDetails.resultTime ?? ""}
            onChange={(e) => {
              updateTestDetails({
                ...testDetails,
                resultTime: e.target.value,
              });
            }}
          ></TextInput>
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="grid-col-auto">
          <RadioGroup<ResultScaleType>
            legend="Type of test result"
            name={`test-detail-${testDetails.key}-test-result-type`}
            onChange={(value) =>
              updateTestDetails({
                ...testDetails,
                resultType: value,
              })
            }
            buttons={ResultScaleTypeOptions}
            selectedRadio={testDetails.resultType}
            required={true}
          />
        </div>
        {testDetails.resultType === ResultScaleType.Ordinal ? (
          <div className="grid-col-auto">
            <RadioGroup<string>
              legend={`Test result`}
              buttons={ordinalResultButtons}
              name={`test-detail-${testDetails.key}-test-result-value`}
              selectedRadio={testDetails.resultValue}
              required={true}
              onChange={(value) =>
                updateTestDetails({ ...testDetails, resultValue: value })
              }
            />
          </div>
        ) : undefined}
        {testDetails.resultType === ResultScaleType.Quantitative ||
        testDetails.resultType === ResultScaleType.Nominal ? (
          <div className="grid-col-auto">
            <TextInput
              name={`test-detail-${testDetails.key}-test-result-value`}
              type={"text"}
              label={`Test result`}
              onChange={(e) =>
                updateTestDetails({
                  ...testDetails,
                  resultValue: e.target.value,
                })
              }
              value={testDetails.resultValue}
              required={true}
            ></TextInput>
          </div>
        ) : undefined}
        <div className="grid-col-auto">
          <div className="usa-form-group">
            <Label
              htmlFor={`test-detail-${testDetails.key}-test-result-interpretation`}
            >
              Test result interpretation
            </Label>
            <Textarea
              id={`test-detail-${testDetails.key}-test-result-interpretation`}
              name={`test-detail-${testDetails.key}-test-result-interpretation`}
              className={"interpretation-textarea"}
              onChange={(e) =>
                updateTestDetails({
                  ...testDetails,
                  resultInterpretation: e.target.value,
                })
              }
              maxLength={10000}
              value={testDetails.resultInterpretation ?? ""}
            ></Textarea>
          </div>
        </div>
      </div>
    </>
  );
};

export default TestDetailSection;
