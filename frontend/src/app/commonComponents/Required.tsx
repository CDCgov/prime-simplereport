import React from "react";

const Required = (props: { label?: React.ReactNode }) => (
  <>
    {props.label}
    <abbr title="required" className="usa-hint usa-hint--required">
      {props.label && " "}*
    </abbr>
  </>
);

export default Required;
