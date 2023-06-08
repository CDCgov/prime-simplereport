import React from "react";

interface FormGroupProps {
  title: string;
  children: React.ReactNode;
  asSectionGroup?: boolean;
}

const FormGroup = (props: FormGroupProps) => {
  const WappringEl = props.asSectionGroup ? "div" : "form";

  return (
    <WappringEl className="prime-formgroup">
      <fieldset className="usa-fieldset">
        <legend className="prime-formgroup-heading usa-legend">
          {props.title}
        </legend>
        {props.children}
      </fieldset>
    </WappringEl>
  );
};

export default FormGroup;
