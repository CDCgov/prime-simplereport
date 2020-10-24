import PropTypes from "prop-types";
import { useEffect, useState } from "react";

const Expire = ({ onExpire, children, delay }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onExpire) {
        onExpire();
      }
    }, delay);
  }, [children, delay, onExpire]);

  return isVisible ? children : null;
};

Expire.propTypes = {
  delay: PropTypes.number, // milliseconds
  onExpire: PropTypes.func,
};
export default Expire;
