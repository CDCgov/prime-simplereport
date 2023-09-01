import React from "react";
import { Icon } from "@trussworks/react-uswds";

import { LinkWithQuery } from "../commonComponents/LinkWithQuery";

const SupportHomeLink: React.FC<any> = () => {
  return (
    <div className="display-flex flex-align-center">
      <Icon.ArrowBack
        className={"text-base margin-left-neg-2px"}
        aria-hidden={true}
      />
      <LinkWithQuery to={`/admin`} className="margin-left-05">
        Support admin
      </LinkWithQuery>
    </div>
  );
};

export default SupportHomeLink;
