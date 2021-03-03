import React from "react";

const LabeledText = (props: {
  label: string;
  text?: string | null;
}): React.ReactElement => (
  <>
    <strong>{props.label}</strong>
    <p>{props.text}</p>
  </>
);

export default LabeledText;
