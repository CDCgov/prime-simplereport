import { ComboBox as TrussComboBox, Label } from "@trussworks/react-uswds";
import React, { ComponentPropsWithRef, forwardRef } from "react";

import Required from "./Required";

type TrussComponentProps = ComponentPropsWithRef<typeof TrussComboBox>;
export type ComboBoxProps = TrussComponentProps & {
  required?: boolean;
};

// props here are only the required ones from Truss and can be extended
// as needed with additional values.
const ComboBox: React.FC<ComboBoxProps> = forwardRef(function (
  { id, name, required, options, onChange, disabled }: ComboBoxProps,
  ref
) {
  return (
    <>
      <Label htmlFor={id}>
        {name} {required && <Required />}
      </Label>
      <TrussComboBox
        name={name}
        id={id}
        options={options}
        onChange={onChange}
        disabled={disabled}
        ref={ref}
        inputProps={{
          "aria-required": required,
        }}
      />
    </>
  );
});

export default ComboBox;
