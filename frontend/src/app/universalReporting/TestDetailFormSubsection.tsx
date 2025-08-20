import React from "react";
import moment from "moment";
import { Label, Textarea } from "@trussworks/react-uswds";
import { now } from "lodash";

import TextInput from "../commonComponents/TextInput";
import RadioGroup from "../commonComponents/RadioGroup";
import { formatDate } from "../utils/date";
import "./TestDetailSection.scss";
import { ResultScaleType, TestDetailsInput } from "../../generated/graphql";

import {
  ordinalResultOptions,
  ResultScaleTypeOptions,
} from "./LabReportFormUtils";

type TestDetailFormSubsectionProps = {
  resultIndex: number;
  testDetails: TestDetailsInput;
  updateTestDetails: (details: TestDetailsInput) => void;
};

const TestDetailFormSubsection = ({
  resultIndex,
  testDetails,
  updateTestDetails,
}: TestDetailFormSubsectionProps) => {
  const handleResultDateUpdate = (value: string) => {
    if (value) {
      const newResultDate = moment(value);
      if (testDetails.resultDate) {
        const previousCollectionDate = moment(testDetails.resultDate);
        newResultDate.hour(previousCollectionDate.hour());
        newResultDate.minute(previousCollectionDate.minute());
      }
      updateTestDetails({
        ...testDetails,
        resultDate: newResultDate.toISOString(),
      });
    }
  };

  const handleResultTimeUpdate = (value: string) => {
    if (value) {
      const [hours, minutes] = value.split(":");
      const newResultDate = moment(testDetails.resultDate || now())
        .hours(parseInt(hours))
        .minutes(parseInt(minutes));
      updateTestDetails({
        ...testDetails,
        resultDate: newResultDate.toISOString(),
      });
    }
  };

  return (
    <>
      <div className="grid-row grid-gap flex-justify">
        <div className="grid-col-auto">
          <h4 className={"margin-bottom-0"}>
            Result {resultIndex + 1} -{" "}
            {testDetails.testPerformedLoincLongCommonName}
          </h4>
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="grid-col-3">
          <RadioGroup<ResultScaleType>
            legend="Test result type"
            name={`test-detail-${testDetails.testPerformedLoinc}-test-result-type`}
            onChange={(value) =>
              updateTestDetails({
                ...testDetails,
                resultType: value,
                resultValue: "",
              })
            }
            buttons={ResultScaleTypeOptions}
            selectedRadio={testDetails.resultType}
          />
        </div>
        {testDetails.resultType === ResultScaleType.Ordinal && (
          <div className="grid-col-3">
            <RadioGroup<string>
              legend={`Test result value`}
              buttons={ordinalResultOptions}
              name={`test-detail-${testDetails.testPerformedLoinc}-test-result-value`}
              selectedRadio={testDetails.resultValue}
              onChange={(value) =>
                updateTestDetails({ ...testDetails, resultValue: value })
              }
            />
          </div>
        )}
        {(testDetails.resultType === ResultScaleType.Quantitative ||
          testDetails.resultType === ResultScaleType.Nominal) && (
          <div className="grid-col-3">
            <TextInput
              name={`test-detail-${testDetails.testPerformedLoinc}-test-result-value`}
              type={"text"}
              label={`Test result value`}
              onChange={(e) =>
                updateTestDetails({
                  ...testDetails,
                  resultValue: e.target.value,
                })
              }
              value={testDetails.resultValue}
            ></TextInput>
          </div>
        )}
      </div>
      <div className="grid-row grid-gap">
        <div className="grid-col-6">
          <TextInput
            name={`test-detail-${testDetails.testPerformedLoinc}-test-result-date`}
            type="date"
            label="Result date"
            min={formatDate(new Date("Jan 1, 2020"))}
            max={formatDate(moment().toDate())}
            value={formatDate(moment(testDetails.resultDate).toDate())}
            onChange={(e) => handleResultDateUpdate(e.target.value)}
          ></TextInput>
        </div>
        <div className="grid-col-6">
          <TextInput
            name={`test-detail-${testDetails.testPerformedLoinc}-test-result-time`}
            type="time"
            label="Result time"
            step="60"
            value={moment(testDetails.resultDate).format("HH:mm")}
            onChange={(e) => handleResultTimeUpdate(e.target.value)}
          ></TextInput>
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="grid-col-6">
          <div className="usa-form-group">
            <Label
              htmlFor={`test-detail-${testDetails.testPerformedLoinc}-test-result-interpretation`}
            >
              Notes (optional)
            </Label>
            <Textarea
              id={`test-detail-${testDetails.testPerformedLoinc}-test-result-interpretation`}
              name={`test-detail-${testDetails.testPerformedLoinc}-test-result-interpretation`}
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

export default TestDetailFormSubsection;
