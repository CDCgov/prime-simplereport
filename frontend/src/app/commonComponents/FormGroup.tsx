import React from "react";
import "./FormGroup.scss";

interface Props {
  title: string;
  children: React.ReactNode;
}

const FormGroup = (props: Props) => (
  <div className="prime-formgroup">
    <h3>{props.title}</h3>
    {props.children}
  </div>
);

export default FormGroup;
