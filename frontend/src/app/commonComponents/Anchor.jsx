import React from "react";
import PropTypes from "prop-types";

const Anchor = ({ onClick, text }) => {
  return (
    <button className={"prime-link"} onClick={onClick}>
      {text}
    </button>
  );
};

Anchor.propTypes = {
  onClick: PropTypes.func,
  text: PropTypes.string,
};

export default Anchor;
