import React, { useRef, useState, useMemo } from "react";
import classNames from "classnames";
import keyBy from "lodash/keyBy";

import MultiSelect from "../../../commonComponents/MultiSelect/MultiSelect";
import Button from "../../../commonComponents/Button/Button";
import ComboBox from "../../../commonComponents/ComboBox";
import Card from "../../../commonComponents/Card/Card";
import Modal from "../../../commonComponents/Modal";
import TextInput from "../../../commonComponents/TextInput";

import SpecimenSelect from "./SpecimenSelect";
import MultiSelectList, {
  MultiSelectDropdownOption,
  type DropdownProps,
} from "./MultiSelectList";
import SearchResults from "./SearchResults";

import {
  useGetConditionsQuery,
  useGetLabsByConditionsQuery,
} from "../../../../generated/graphql";
import { buildConditionsOptionList } from "../../../universalReporting/LabReportFormUtils";

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

const LabSearchResults = (props: DropdownProps & { loading: boolean }) => {
  const { items, dropdownRef, loading, shouldShowSuggestions, ...rest } = props;
  if (!shouldShowSuggestions) return null;

  return (
    <SearchResults
      headers={["Name", "LOINC Code", "Action"]}
      loading={loading}
      resultCount={items.length}
      dropdownRef={dropdownRef}
      {...rest}
    >
      {items.map((item, idx) => (
        <tr key={`${item.value}-${idx}`} aria-label={`lab-${idx}`}>
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
  const [showModal, setShowModal] = useState(false);
  const [conditionCode, setConditionCode] = useState("");
  const [labCodes, setLabCodes] = useState<string[]>([]);

  const { data: conditionsData, loading: conditionsLoading } =
    useGetConditionsQuery();

  const { data: labsData, loading: labsLoading } = useGetLabsByConditionsQuery({
    variables: { conditionCodes: [conditionCode] },
  });

  const conditionOptions = buildConditionsOptionList(
    conditionsData?.conditions ?? []
  );

  const labOptions = labsData?.labs
    ? labsData.labs.map((lab) => ({
        label: lab.display,
        value: lab.code ?? "",
        ...lab,
      }))
    : [];

  // create map of lab objects using the `code` as the key
  // for efficient lab lookup
  const labsMap = useMemo(() => {
    if (!labsData || !labsData.labs) return {};
    return keyBy(labsData.labs, (lab) => lab.code);
  }, [labsData?.labs]);

  const onChangeCondition = (selected?: string) => {
    setConditionCode(selected ?? "");
  };

  const onChangeLab = (option: MultiSelectDropdownOption) => {
    setLabCodes((prev) => [...prev, option.value]);
  };

  const filterLabOptions = (inputValue: string) => {
    if (!inputValue.trim()) return labOptions;

    const results = labOptions.filter((lab) =>
      lab.display.toLowerCase().includes(inputValue)
    );

    return results;
  };

  return (
    <CardContainer
      className="test-order-settings"
      headingText="Manage test orders for all conditions"
    >
      <div className="position-relative bg-base-lightest">
        <div className="display-flex grid-row grid-gap flex-row flex-align-end padding-x-3 padding-bottom-3">
          <CardBody className="padding-y-2">
            <div className="grid-row">
              <div className="grid-col-12 tablet:grid-col-6">
                {!conditionsLoading && (
                  <ComboBox
                    id="selected-condition"
                    name="Filter by condition"
                    options={conditionOptions}
                    onChange={onChangeCondition}
                    defaultValue={conditionCode}
                    aria-required={true}
                  />
                )}
              </div>
            </div>

            <div className="grid-row">
              <div className="grid-col-12">
                {!labsLoading && (
                  <MultiSelectList
                    id="lab-select"
                    label="Search by LOINC name"
                    placeholder="Enter a LOINC display name, long name or short name"
                    options={labOptions}
                    getItems={filterLabOptions}
                    onOptionSelect={onChangeLab}
                    DropdownComponent={(props: DropdownProps) => (
                      <LabSearchResults loading={labsLoading} {...props} />
                    )}
                  />
                )}
              </div>
            </div>
          </CardBody>
        </div>
      </div>

      <Modal
        showModal={showModal}
        onClose={() => {}}
        contentLabel="Edit Description"
      >
        <Modal.Header styleClassNames="margin-bottom-0">
          Edit Description
        </Modal.Header>

        <TextInput
          className="margin-top-0"
          label="Display"
          labelSrOnly={true}
          name="display"
          hintText="This text is what reporters will see as they select the test order for their report."
        />
        <div>
          <Button variant="unstyled" className="padding-right-1">
            Save
          </Button>
          <Button variant="unstyled">Reset</Button>
        </div>

        <TextInput label="Description" labelSrOnly={true} name="description" />
        <div>
          <Button variant="unstyled" className="padding-right-1">
            Save
          </Button>
          <Button variant="unstyled">Reset</Button>
        </div>

        <SpecimenSelect specimenOptions={[]} onChange={() => {}} />

        <div className="margin-y-2">
          <Button>Confirm</Button>
          <Button variant="outline">Cancel</Button>
        </div>
      </Modal>

      <CardBody>
        {labCodes.map((labCode) => {
          const lab = labsMap[labCode];

          return (
            <Card bodyKicker={lab.display}>
              {lab.description && <p>{lab.description}</p>}

              <div className="margin-bottom-2">
                <Button variant="outline">Edit Description</Button>
                <Button variant="outline">Add Specimen Type</Button>
              </div>
            </Card>
          );
        })}
      </CardBody>
    </CardContainer>
  );
};

export default ManageTestOrder;
