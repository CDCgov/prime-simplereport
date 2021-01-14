import React from "react";

const Optional = (props: { label?: React.ReactNode }) => (
  <>
    {props.label}<span className={"usa-hint"}> (optional)</span>
  </>
);

export default Optional;
