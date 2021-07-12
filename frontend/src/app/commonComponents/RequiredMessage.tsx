import React from "react";

import Required from "./Required";

interface Props {
  message?: string;
}

const RequiredMessage = (props: Props) => {
  const message =
    props.message || "Required fields are marked with an asterisk";

  return (
    <p className="message--required">
      {message} (<Required />
      ).
    </p>
  );
};

export default RequiredMessage;
