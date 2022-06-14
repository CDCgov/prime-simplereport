import React from "react";

import { LinkWithQuery } from "../commonComponents/LinkWithQuery";

const ResultsNav = () => {
  const classNameByActive = ({ isActive }: { isActive: boolean }) =>
    isActive ? "active" : "";

  return (
    <div className="prime-home">
      <div className="grid-container">
        <nav className="prime-secondary-nav" aria-label="Secondary navigation">
          <ul className="usa-nav__secondary-links prime-nav">
            <li className="usa-nav__secondary-item">
              <LinkWithQuery
                to={`/results/1`}
                end
                className={classNameByActive}
              >
                Test results
              </LinkWithQuery>
            </li>
            <li className="usa-nav__secondary-item">
              <LinkWithQuery
                to={`/results/upload`}
                end
                className={classNameByActive}
              >
                CSV upload
              </LinkWithQuery>
            </li>
            <li className="usa-nav__secondary-item">
              <LinkWithQuery
                to={`/results/upload/submissions`}
                className={classNameByActive}
              >
                CSV upload history
              </LinkWithQuery>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default ResultsNav;
