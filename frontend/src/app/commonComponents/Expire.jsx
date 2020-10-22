import PropTypes from "prop-types";
import { useEffect, useState } from "react";

const Expire = (props) => {
  const [isVisible, setIsVisible] = useState(true);
  const { onExpire, children, delay } = { ...props };

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
