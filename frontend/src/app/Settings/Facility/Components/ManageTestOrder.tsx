import React, { useRef, useState, useMemo } from "react";
import classNames from "classnames";
import keyBy from "lodash/keyBy";

import MultiSelect from "../../../commonComponents/MultiSelect/MultiSelect";
import Button from "../../../commonComponents/Button/Button";
import {
  useGetConditionsQuery,
  useGetLabsByConditionsQuery,
} from "../../../../generated/graphql";
import { buildConditionsOptionList } from "../../../universalReporting/LabReportFormUtils";
import Card from "../../../commonComponents/Card/Card";

// import SearchResults from "./SearchResults";

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
}) => {
  return (
    <div className={classNames("usa-card__body", className)}>{children}</div>
  );
};

// const LabSearchResults = (props: {
//   dropDownRef: React.RefObject<HTMLDivElement>;
//   items: { label: string; value: string }[];
//   // setSelectedItem: (item: any) => void;
//   loading: boolean;
//   children: React.ReactNode;
// }) => {
//   const { loading, items, dropDownRef, ...rest } = props;
//   const headers = ["Name", "LOINC Code", "Action"];

//   return (
//     <SearchResults
//       headers={headers}
//       loading={loading}
//       resultCount={items.length}
//       dropDownRef={dropDownRef}
//       {...rest}
//     >
//       {items.map((item, idx) => (
//         <tr key={`${item.value}-${idx}`} aria-label={`lab-${idx}`}>
//           <td>{item.label}</td>
//           <td>{item.value}</td>
//           <td>
//             <Button
//               label="Add test order"
//               ariaLabel={`Select ${item.label} ${item.value}`}
//               onClick={() => {}}
//             />
//           </td>
//         </tr>
//       ))}
//     </SearchResults>
//   );
// };

const ManageTestOrder = () => {
  const [conditionCodes, setConditionCodes] = useState<string[]>([]);
  const [labCodes, setLabCodes] = useState<string[]>([]);

  const { data: conditionsData, loading: conditionsLoading } =
    useGetConditionsQuery();

  const conditionsOptions = buildConditionsOptionList(
    conditionsData?.conditions ?? []
  );

  const onChangeConditions = (selected: string[]) => {
    setConditionCodes(selected);
  };

  const { data: labsData, loading: labsLoading } = useGetLabsByConditionsQuery({
    variables: { conditionCodes },
  });

  const labsDataOptions = labsData?.labs
    ? labsData.labs.map((lab) => ({
        label: lab.display,
        value: lab.code ?? "",
        ...lab,
      }))
    : [];

  const labsMap = useMemo(() => {
    console.log("recalc");
    if (!labsData || !labsData.labs) return {};

    // create map of lab objects using the `code` as the key
    return keyBy(labsData.labs, (lab) => lab.code);
  }, [labsData?.labs]);

  // const searchLabs = (inputValue: string) => {
  //   if (!inputValue.trim()) return labsDataOptions;
  //   const results = labs.filter((lab) =>
  //     lab.toLowerCase().includes(inputValue)
  //   );
  //   return results;
  // };

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
                    initialSelectedValues={conditionCodes}
                  />
                )}
              </div>
            </div>

            <div className="grid-row">
              <div className="grid-col-12">
                {!labsLoading && (
                  <MultiSelect
                    label="Search by LOINC name"
                    placeholder="Enter a LOINC display name, long name or short name"
                    name="labs"
                    options={labsDataOptions}
                    initialSelectedValues={labCodes}
                    // getFilteredDropdownComponentItems={searchLabs}
                    onChange={(selected) => setLabCodes(selected)}
                    showPills={false}
                  />
                )}
              </div>
            </div>
          </CardBody>
        </div>
      </div>

      <CardBody>
        {labCodes.map((labCode) => {
          const lab = labsMap[labCode];

          return <Card>sup</Card>;
        })}
      </CardBody>
    </CardContainer>
  );
};

export default ManageTestOrder;
