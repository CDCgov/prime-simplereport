import React from 'react';
import MultiSelect from "../../../commonComponents/MultiSelect/MultiSelect";

interface SpecimenSelectProps {
  specimenOptions: { value: string; label: string; }[];
  onChange: (selectedItems: string[]) => void;
  initialSelectedValues?: string[];
  heading?: string;
  placeholder?: string;
}

const noop = () => {};

const SpecimenSelect = (props: SpecimenSelectProps) => {
  const heading = props.heading ?? 'Add Specimen Type';
  const placeholder = props.placeholder ?? 'Enter a name or SNOMED code';

  return (
    <div>
      <h2 className="font-heading-lg margin-bottom-0">{heading}</h2>

      <MultiSelect
        className="margin-top-0"
        name="add-specimen-type"
        label="Add Specimen Type"
        labelSrOnly={true}
        placeholder={placeholder}
        onChange={props.onChange}
        initialSelectedValues={props.initialSelectedValues ?? []}
        options={props.specimenOptions ?? []}
      />
    </div>
  );
};

export default SpecimenSelect;