import React, { useState } from "react";
import classNames from "classnames";

import MultiSelect from "../../../commonComponents/MultiSelect/MultiSelect";
import Button from "../../../commonComponents/Button/Button";
import {
  useGetConditionsQuery,
  useGetLabsByConditionsQuery,
} from "../../../../generated/graphql";
import { buildConditionsOptionList } from "../../../universalReporting/LabReportFormUtils";

import SearchResults from "./SearchResults";

const CardContainer = ({
  className,
  headingText,
  children,
}: {
  className?: string;
  headingText?: string;
  children?: React.ReactNode;
}) => (
  <div className={classNames("prime-container card-container", className)}>
    {headingText && (
      <div className="usa-card__header">
        <h2 className="font-heading-lg">{headingText}</h2>
      </div>
    )}

    {children}
  </div>
);

const CardBody = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => <div className={classNames("usa-card__body", className)}>{children}</div>;

const LabSearchResults = (props: {
  items: { label: string; value: string }[];
  setSelectedItem: (item: any) => void;
  loading: boolean;
  headers: string[];
  resultCount: number;
  children: React.ReactNode;
}) => {
  const { headers, loading, items } = props;
  console.log({ loading });

  return (
    <SearchResults
      headers={headers}
      loading={loading}
      resultCount={items.length}
    >
      {items.map((item, idx) => (
        <tr key={item.value} aria-label={`lab-${idx}`}>
          <td>{item.label}</td>
          <td>{item.value}</td>
          <td>
            <Button
              label="Add test order"
              ariaLabel={`Select ${item.label} ${item.value}`}
              onClick={() => {}}
            />
          </td>
        </tr>
      ))}
    </SearchResults>
  );
};

const ManageTestOrder = () => {
  const [conditions, setConditions] = useState<string[]>([]);

  const { data: conditionsData, loading: conditionsLoading } =
    useGetConditionsQuery();
  const conditionsOptions = buildConditionsOptionList(
    conditionsData?.conditions ?? []
  );

  const onChangeConditions = (selected: string[]) => {
    setConditions(selected);
  };

  const { data: labsData, loading: labsLoading } = useGetLabsByConditionsQuery({
    variables: { conditionCodes: conditions },
  });
  const labsDataOptions = labsData?.labs
    ? labsData.labs.map((lab) => ({
        label: lab.display,
        value: lab.systemCode ?? "",
      }))
    : [];

  return (
    <CardContainer
      className="test-order-settings"
      headingText="Manage test orders for all conditions"
    >
      <div className="position-relative bg-base-lightest">
        <div className="display-flex grid-row grid-gap flex-row flex-align-end padding-x-3 padding-bottom-3">
          <CardBody className="padding-y-0">
            <div className="grid-row">
              <div className="grid-col-12 tablet:grid-col-6">
                {!conditionsLoading && (
                  <MultiSelect
                    label="Search by conditions"
                    placeholder="Enter name of condition"
                    name="conditions"
                    onChange={onChangeConditions}
                    options={conditionsOptions}
                    initialSelectedValues={conditions}
                  />
                )}
              </div>
            </div>

            <div className="grid-row">
              <div className="grid-col-12">
                <MultiSelect
                  label="Search by LOINC name"
                  placeholder="Enter a LOINC display name, long name or short name"
                  name="labs"
                  options={labsDataOptions}
                  initialSelectedValues={[]}
                  getFilteredDropdownComponentItems={() => []}
                  DropdownComponent={(props) => (
                    <LabSearchResults
                      headers={["Name", "LOINC Code", "Action"]}
                      loading={labsLoading}
                      {...props}
                    />
                  )}
                  onChange={() => {}}
                />
              </div>
            </div>
          </CardBody>
        </div>
      </div>

      <CardBody>test</CardBody>
    </CardContainer>
  );
};

export default ManageTestOrder;
