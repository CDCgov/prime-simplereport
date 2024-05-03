import React from "react";
import classnames from "classnames";
import { UIDConsumer } from "react-uid";

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

  const columnSegmentedBoxes: Checkbox[][] = [];
  if (displayAsColumns) {
    let tempSegment: Checkbox[] = [];
    boxes.forEach((box) => {
      tempSegment.push(box);
      if (tempSegment.length === columnItemlength) {
        columnSegmentedBoxes.push(tempSegment);
        tempSegment = [];
      }
    });
    if (tempSegment.length > 0) columnSegmentedBoxes.push(tempSegment);
  }

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
        {displayAsColumns ? (
          <div className="grid-row">
            {columnSegmentedBoxes.map((boxes) => (
              <div className="tablet: grid-col">
                {checkboxFragmentToRender(boxes)}
              </div>
            ))}
          </div>
        ) : (
          checkboxFragmentToRender(boxes)
        )}
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

  return (
    <UIDConsumer>
      {(_, uid) => (
        <div className="checkboxes">
          {boxes.map(
            ({ value, label, disabled, checked, ...inputProps }, i) => (
              <div className="usa-checkbox" key={uid(i)}>
                <input
                  className="usa-checkbox__input"
                  checked={checked}
                  id={uid(i)}
                  onChange={onChange}
                  type="checkbox"
                  value={value}
                  name={name}
                  ref={inputRef}
                  disabled={disabled || props.disabled}
                  {...inputProps}
                />
                <label className="usa-checkbox__label" htmlFor={uid(i)}>
                  {label}
                </label>
              </div>
            )
          )}
        </div>
      )}
    </UIDConsumer>
  );
};

export default Checkboxes;
