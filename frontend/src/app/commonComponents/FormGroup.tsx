import React from 'react';

interface Props {
  title: string;
  children: React.ReactNode;
}

const FormGroup = (props: Props) => (
  <div className="prime-formgroup">
    <fieldset className="usa-fieldset">
      <legend className="prime-formgroup-heading usa-legend">
        {props.title}
      </legend>
      {props.children}
    </fieldset>
  </div>
);

export default FormGroup;
