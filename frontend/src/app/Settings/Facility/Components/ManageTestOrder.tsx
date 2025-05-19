import React, { useState, useMemo } from "react";
import keyBy from "lodash/keyBy";

import Button from "../../../commonComponents/Button/Button";
import ComboBox from "../../../commonComponents/ComboBox";
import Card from "../../../commonComponents/Card/Card";
import Modal from "../../../commonComponents/Modal";
import TextInput from "../../../commonComponents/TextInput";
import {
  useGetConditionsQuery,
  useGetLabsByConditionsQuery,
} from "../../../../generated/graphql";
import { buildConditionsOptionList } from "../../../universalReporting/LabReportFormUtils";

import SpecimenSelect from "./SpecimenSelect";
import MultiSelectList, {
  MultiSelectDropdownOption,
  type DropdownProps,
} from "./MultiSelectList";
import SearchResults from "./SearchResults";

interface EditingTestOrder {
  display: string;
  description: string;
  specimenIds: string[];
}

const initialTestOrderState = {
  display: '',
  description: '',
  specimenIds: []
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
              className="margin-y-1"
              variant="unstyled"
              label="Add test order"
              ariaLabel={`Select ${item.label} ${item.value}`}
              onClick={() => props.setSelectedItem(item)}
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
  const [testOrder, setTestOrder] = useState<EditingTestOrder>(initialTestOrderState);

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
    setLabCodes([]);
    setConditionCode(selected ?? "");
  };

  const onChangeLab = (option: MultiSelectDropdownOption) => {
    setLabCodes((prev) => [...prev, option.value]);
  };

  const filterLabOptions = (inputValue: string) => {
    const results = labOptions.filter((lab) =>
      lab.display.toLowerCase().includes(inputValue) &&
      !labCodes.includes(lab.code)
    );

    return results;
  };

  return (
    <div className="prime-container card-container test-order-settings">
      <div className="usa-card__header">
        <h2 className="font-heading-lg">Manage test orders for all conditions</h2>
      </div>

      <div className="position-relative bg-base-lightest">
        <div className="display-flex grid-row grid-gap flex-row flex-align-end padding-x-3 padding-bottom-3">
          <div className="usa-card__body padding-y-2">
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
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        showModal={showModal}
        onClose={() => {
          setTestOrder(initialTestOrderState);
          setShowModal(false);
        }}
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
          value={testOrder.display}
        />
        <div>
          <Button variant="unstyled" className="padding-right-1">
            Save
          </Button>
          <Button variant="unstyled">Reset</Button>
        </div>

        <TextInput label="Description" labelSrOnly={true} name="description" defaultValue={testOrder.description} />
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

      <div className="usa-card__body">
        {labCodes.length === 0 && (
          <div className="margin-y-4 text-center">
            <p><b>There are no test orders.</b></p>
            <p>Search for a condition to start adding test orders.</p>
          </div>
        )}

        {labCodes.length > 0 && (
          <div>
            <p className="font-sans-lg margin-top-2 text-bold">Test order</p>
            <p>Manage and edit test order descriptions along with adding multiple specimen types.</p>
          </div>
        )}

        {labCodes.map((labCode, idx) => {
          const lab = labsMap[labCode];

          return (
            <div className="margin-bottom-2" key={`${lab.display}-${idx}`}>
              <Card
                className="position-relative"
                bodyKicker={lab.display}
                closeAction={() => {
                  setLabCodes((prev) => {
                    return prev.filter((code) => code !== lab.code);
                  });
                }}
              >
                {lab.description && <p>{lab.description}</p>}

                <div className="margin-bottom-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      console.log(lab.description);
                      setTestOrder((prev) => ({
                        ...prev,
                        display: lab.display,
                        description: lab.description ?? '',
                        specimenIds: []
                      }));

                      setShowModal(true);
                    }}
                  >
                    Edit Description
                  </Button>
                  <Button variant="outline">Add Specimen Type</Button>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ManageTestOrder;
