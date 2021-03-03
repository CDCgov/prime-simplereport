import React from "react";

const Required = (props: { label?: React.ReactNode }) => (
  <>
    {props.label}
    <span className="usa-sr-only">Required</span>
    <span className="usa-hint--required"> *</span>
  </>
);

export default Required;
