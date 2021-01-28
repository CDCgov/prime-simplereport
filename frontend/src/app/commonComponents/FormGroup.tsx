import React from "react";

interface Props {
  title: string;
  children: React.ReactNode;
}

const FormGroup = (props: Props) => (
  <div className="prime-formgroup">
    <h2 className="prime-formgroup-heading">{props.title}</h2>
    {props.children}
  </div>
);

export default FormGroup;
