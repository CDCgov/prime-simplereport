import { ComboBox as TrussComboBox, Label } from "@trussworks/react-uswds";
import React, { ComponentPropsWithRef, forwardRef } from "react";

import Required from "../../commonComponents/Required";

type TrussComponentProps = ComponentPropsWithRef<typeof TrussComboBox>;
export type ComboBoxProps = TrussComponentProps & {
  label?: string | React.ReactNode;
  required?: boolean;
};

// props here are only the required ones from Truss and can be extended
// as needed with additional values.
const ComboBox: React.FC<ComboBoxProps> = forwardRef(function (
  props: ComboBoxProps,
  ref
) {
  return (
    <>
      {typeof props.label === "string" ? (
        <Label htmlFor={props.id}>
          {props.label} {props.required && <Required />}
        </Label>
      ) : (
        props.label
      )}
      <TrussComboBox {...props} ref={ref} />
    </>
  );
});

export default ComboBox;
