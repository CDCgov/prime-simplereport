import React from "react";
import PropTypes from "prop-types";

const LabeledText = ({ label, text }) => {
  return (
    <React.Fragment>
      <strong>{label} </strong>
      <p>{text}</p>
    </React.Fragment>
  );
};

LabeledText.propTypes = {
  label: PropTypes.string,
  text: PropTypes.func,
};

export default LabeledText;
