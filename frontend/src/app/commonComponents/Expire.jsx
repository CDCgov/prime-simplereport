import { useEffect, useState } from "react";
import PropTypes from "prop-types";

const Expire = (props) => {
  const [children, setChildren] = useState(props.children);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setChildren(props.children); // update children if a new child is provided
    setIsVisible(true); // reset visibility to true
    setTimeout(() => {
      setIsVisible(false);
      if (props.onExpire) {
        props.onExpire();
      }
    }, props.delay);
  }, [props.children]); // rerun if children changes

  return isVisible ? children : null;
};

Expire.propTypes = {
  delay: PropTypes.number, // milliseconds
  onExpire: PropTypes.func,
};
export default Expire;
