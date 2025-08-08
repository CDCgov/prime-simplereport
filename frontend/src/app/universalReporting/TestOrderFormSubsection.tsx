import { Radio } from "@trussworks/react-uswds";
import React, { Dispatch } from "react";

import SearchInput from "../testQueue/addToQueue/SearchInput";
import { Lab } from "../../generated/graphql";

type TestOrderFormSectionProps = {
  hasSelectedCondition: boolean;
  labDataLoading: boolean;
  labs: Lab[];
  testOrderLoinc: string;
  updateTestOrderLoinc: (lab: Lab) => void;
  testOrderSearchString: string;
  setTestOrderSearchString: Dispatch<string>;
};

const TestOrderFormSubsection = ({
  hasSelectedCondition,
  labDataLoading,
  labs,
  testOrderLoinc,
  updateTestOrderLoinc,
  testOrderSearchString,
  setTestOrderSearchString,
}: TestOrderFormSectionProps) => {
  const filteredLabData = labs.filter(
    (lab) =>
      lab.display.toLowerCase().includes(testOrderSearchString) ||
      lab.description?.toLowerCase().includes(testOrderSearchString) ||
      lab.longCommonName.includes(testOrderSearchString)
  );

  return (
    <>
      <div className="grid-row">
        <div className="grid-col-auto">
          <h2 className={"font-sans-lg"}>Test Order</h2>
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="grid-col-10">
          {!hasSelectedCondition && (
            <div>Please select a condition before selecting a test order.</div>
          )}
          {hasSelectedCondition && labDataLoading && (
            <div>Loading test orders from selected condition...</div>
          )}
          {hasSelectedCondition && !labDataLoading && labs.length === 0 && (
            <div>
              No test orders found for selected condition. Please contact
              support for assistance.
            </div>
          )}
          {hasSelectedCondition && !labDataLoading && (
            <fieldset className={"usa-fieldset"}>
              <div className="grid-row flex-justify">
                <div className="grid-col-auto">
                  <legend className="usa-legend margin-top-1">
                    Select the test ordered below
                  </legend>
                </div>
                <div className="grid-col-5">
                  <SearchInput
                    onInputChange={(e) =>
                      setTestOrderSearchString(e.target.value)
                    }
                    queryString={testOrderSearchString}
                    placeholder={`Filter test orders`}
                    showSubmitButton={false}
                  />
                </div>
              </div>
              {filteredLabData?.length === 0 && !labDataLoading && (
                <>
                  <div className="grid-row grid-gap">
                    <div className="grid-col-auto padding-y-6">
                      No results found.
                    </div>
                  </div>
                </>
              )}
              {filteredLabData?.map((lab) => {
                return (
                  <Radio
                    id={`test-order-lab-${lab.code}`}
                    key={lab.code}
                    name={`input-test-order-lab`}
                    label={lab.display}
                    labelDescription={lab.description ?? lab.longCommonName}
                    value={lab.code}
                    checked={lab.code === testOrderLoinc}
                    onChange={() => {
                      setTestOrderSearchString(lab.display);
                      updateTestOrderLoinc(lab);
                    }}
                    tile={true}
                  />
                );
              })}
            </fieldset>
          )}
        </div>
      </div>
    </>
  );
};

export default TestOrderFormSubsection;
