import React from "react";

import { LinkWithQuery } from "../commonComponents/LinkWithQuery";

const ResultsNav = () => {
  const classNameByActive = ({ isActive }: { isActive: boolean }) =>
    isActive ? "active" : "";

  return (
    <nav className="prime-secondary-nav" aria-label="Secondary navigation">
      <ul className="usa-nav__secondary-links prime-nav">
        <li className="usa-nav__secondary-item">
          <LinkWithQuery to={`/results/1`} end className={classNameByActive}>
            View test results
          </LinkWithQuery>
        </li>
        <li className="usa-nav__secondary-item">
          <LinkWithQuery
            to={`/results/upload`}
            end
            className={classNameByActive}
          >
            Upload spreadsheet
          </LinkWithQuery>
        </li>
        <li className="usa-nav__secondary-item">
          <LinkWithQuery
            to={`/results/upload/submissions`}
            className={classNameByActive}
          >
            View upload history
          </LinkWithQuery>
        </li>
      </ul>
    </nav>
  );
};

export default ResultsNav;
