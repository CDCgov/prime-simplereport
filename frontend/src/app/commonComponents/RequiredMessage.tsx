import React from "react";

import Required from "./Required";

const RequiredMessage: React.FC<{}> = () => (
  <p>
    All fields marked with <Required /> are required
  </p>
);

export default RequiredMessage;
