import React from "react";
import PropTypes from "prop-types";

// modern linters don't like the traditional fake links: <a href="#" ...>, which mutate the url without actually routing you to another page
// instead, they recommend having a button that *looks* like a link, and have onClick handle any custom behavior.
// this is that button
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
