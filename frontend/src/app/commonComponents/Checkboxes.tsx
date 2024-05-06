import React from "react";
import classnames from "classnames";

import Required from "../commonComponents/Required";
import Optional from "../commonComponents/Optional";

// Checkbox objects need a value and label but also can have intrinsic `input`
// DOM properties such as `disabled`, `readonly`, `aria-xxx` etc.
export type CheckboxProps = {
  value: string;
  label: string | JSX.Element;
};
type InputProps = JSX.IntrinsicElements["input"];
type Checkbox = CheckboxProps & InputProps;

type Props = FragmentProps & {
  legend: React.ReactNode;
  legendSrOnly?: boolean;
  hintText?: string;
  className?: string;
  errorMessage?: string;
  validationStatus?: "error" | "success";
  required?: boolean;
  displayAsColumns?: true;
  columnItemlength?: number;
};

const DEFAULT_COLUMN_ITEM_LIMIT = 3;

// Take the list of checkboxes and generate an array (ie columns) of checkbox
// arrays to be displayed on the final card
export function generateCheckboxColumns<T>(
  items: T[],
  columnItemlength: number
): T[][] {
  const columnSegmentedItems: T[][] = [];
  let tempSegment: T[] = [];
  items.forEach((item) => {
    tempSegment.push(item);
    if (tempSegment.length === columnItemlength) {
      columnSegmentedItems.push(tempSegment);
      tempSegment = [];
    }
  });
  if (tempSegment.length > 0) columnSegmentedItems.push(tempSegment);
  return columnSegmentedItems;
}

const Checkboxes = (props: Props) => {
  const {
    boxes,
    name,
    legend,
    onChange,
    legendSrOnly,
    validationStatus,
    errorMessage,
    required,
    inputRef,
    hintText,
    displayAsColumns,
    columnItemlength = DEFAULT_COLUMN_ITEM_LIMIT,
  } = props;

  const checkboxFragmentToRender = (boxes: Checkbox[]) => (
    <CheckboxesFragment
      boxes={boxes}
      name={name}
      onChange={onChange}
      inputRef={inputRef}
    />
  );

  // display as one column if displayAsColumn = false
  const checkboxColumns: Checkbox[][] = generateCheckboxColumns(
    boxes,
    displayAsColumns ? columnItemlength : boxes.length
  );

  const checkboxesToDisplay = checkboxColumns.map((boxes) => (
    <div className="tablet: grid-col" key={boxes.map((b) => b.value).join()}>
      {checkboxFragmentToRender(boxes)}
    </div>
  ));

  return (
    <div
      className={classnames(
        "usa-form-group",
        validationStatus === "error" && "usa-form-group--error"
      )}
    >
      <fieldset
        className={classnames("usa-fieldset prime-checkboxes", props.className)}
      >
        <legend
          className={classnames(
            "usa-legend",
            validationStatus === "error" && "usa-label--error",
            legendSrOnly && "usa-sr-only"
          )}
        >
          {required ? <Required label={legend} /> : <Optional label={legend} />}
        </legend>
        {hintText && <span className="usa-hint">{hintText}</span>}
        {validationStatus === "error" && (
          <div className="usa-error-message" role="alert">
            <span className="usa-sr-only">Error: </span>
            {errorMessage}
          </div>
        )}
        <div className="grid-row checkboxes">{checkboxesToDisplay}</div>
      </fieldset>
    </div>
  );
};

type FragmentProps = {
  boxes: Checkbox[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
  name: string;
  disabled?: boolean;
};

const CheckboxesFragment = (props: FragmentProps) => {
  const { boxes, name, inputRef, onChange } = props;

  return boxes.map(({ value, label, disabled, checked, ...inputProps }) => (
    <div className="usa-checkbox" key={value}>
      <input
        className="usa-checkbox__input"
        checked={checked}
        id={`symptom-${value}`}
        onChange={onChange}
        type="checkbox"
        value={value}
        name={name}
        ref={inputRef}
        disabled={disabled || props.disabled}
        {...inputProps}
      />
      <label className="usa-checkbox__label" htmlFor={`symptom-${value}`}>
        {label}
      </label>
    </div>
  ));
};

export default Checkboxes;
