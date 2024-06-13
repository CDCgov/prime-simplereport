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
  numColumnsToDisplay?: number;
};

// Take the list of checkboxes and generate an array (ie columns) of checkbox
// arrays to be displayed on the final card
export function generateCheckboxColumns<T>(
  items: T[],
  numColumnsToDisplay: number
): T[][] {
  const subarrayLength = Math.ceil(items.length / numColumnsToDisplay);
  return generateSubarraysFromItemList(items, subarrayLength);
}

function generateSubarraysFromItemList<T>(items: T[], subarrayLength: number) {
  const arrayOfArrays: T[][] = [];
  let curSubarray: T[] = [];
  items.forEach((item) => {
    curSubarray.push(item);
    if (curSubarray.length === subarrayLength) {
      arrayOfArrays.push(curSubarray);
      curSubarray = [];
    }
  });
  if (curSubarray.length > 0) arrayOfArrays.push(curSubarray);
  return arrayOfArrays;
}

const DEFAULT_COLUMN_DISPLAY_NUMBER = 1;
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
    numColumnsToDisplay = DEFAULT_COLUMN_DISPLAY_NUMBER,
  } = props;

  const checkboxFragmentToRender = (boxes: Checkbox[]) => (
    <CheckboxesFragment
      boxes={boxes}
      name={name}
      onChange={onChange}
      inputRef={inputRef}
    />
  );

  const checkboxColumns: Checkbox[][] = generateCheckboxColumns(
    boxes,
    numColumnsToDisplay
  );

  const checkboxesToDisplay = checkboxColumns.map((boxes) => (
    <div className="tablet:grid-col" key={boxes.map((b) => b.value).join()}>
      {checkboxFragmentToRender(boxes)}
    </div>
  ));

  return (
    <div
      className={classnames(
        "usa-form-group padding-0",
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
    <div className="usa-checkbox" key={`${name}-${value}`}>
      <input
        className="usa-checkbox__input"
        checked={checked}
        id={`${name}-${value}`}
        data-testid={`${name}-${value}`}
        onChange={onChange}
        type="checkbox"
        value={value}
        name={name}
        ref={inputRef}
        disabled={disabled || props.disabled}
        {...inputProps}
      />
      <label className="usa-checkbox__label" htmlFor={`${name}-${value}`}>
        {label}
      </label>
    </div>
  ));
};

export default Checkboxes;
