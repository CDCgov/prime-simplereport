import React from "react";
import iconSprite from "@uswds/uswds/dist/img/sprite.svg";

import { LinkWithQuery } from "../commonComponents/LinkWithQuery";

const SupportHomeLink: React.FC<any> = () => {
  return (
    <div className="display-flex flex-align-center margin-bottom-2">
      <svg
        className="usa-icon text-base margin-left-neg-2px"
        aria-hidden="true"
        focusable="false"
        role="img"
      >
        <use xlinkHref={iconSprite + "#arrow_back"}></use>
      </svg>
      <LinkWithQuery to={`/admin`} className="margin-left-05">
        Support Admin
      </LinkWithQuery>
    </div>
  );
};

export default SupportHomeLink;
