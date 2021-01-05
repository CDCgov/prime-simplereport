import React from "react";

const Required = (props: { label?: React.ReactNode }) => (
  <>
    {props.label} <span className="usa-sr-only">Required</span>
    <span style={{ color: "#E35024" }}>*</span>
  </>
);

export default Required;
