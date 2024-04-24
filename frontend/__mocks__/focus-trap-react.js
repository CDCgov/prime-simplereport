import React from "react";
import FocusTrap from "focus-trap-react";


/**
 * Override displayCheck for testing. See: https://github.com/focus-trap/tabbable#testing-in-jsdom
 */
const FixedComponent = ({focusTrapOptions, ...props}) => {
  const fixedOptions = {...focusTrapOptions};
  fixedOptions.tabbableOptions = {
    ...fixedOptions.tabbableOptions,
    displayCheck: "none"
  }
  return <FocusTrap {...props} focusTrapOptions={fixedOptions} />
}
export default FixedComponent;