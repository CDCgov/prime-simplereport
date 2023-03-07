import React from "react";

interface Props {
  title: string;
  children: React.ReactNode;
}

const FormGroup = (props: Props) => (
  <form className="prime-formgroup">
    <fieldset className="usa-fieldset">
      <legend className="prime-formgroup-heading usa-legend">
        {props.title}
      </legend>
      {props.children}
    </fieldset>
  </form>
);

export default FormGroup;
