import React from "react";

const Optional = (props: { label?: React.ReactNode; className?: string }) => (
  <>{props.label}</>
);

export default Optional;
