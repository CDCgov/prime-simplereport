import React from "react";

import iconSprite from "../../../node_modules/@uswds/uswds/dist/img/sprite.svg";
import { LinkWithQuery } from "../commonComponents/LinkWithQuery";

const SupportHomeLink: React.FC<any> = () => {
  return (
    <div className="display-flex flex-align-center">
      <svg
        className="usa-icon text-base margin-left-neg-2px"
        aria-hidden="true"
        focusable="false"
        role="img"
      >
        <use xlinkHref={iconSprite + "#arrow_back"}></use>
      </svg>
      <LinkWithQuery to={`/admin`} className="margin-left-05">
        Support admin
      </LinkWithQuery>
    </div>
  );
};

export default SupportHomeLink;
