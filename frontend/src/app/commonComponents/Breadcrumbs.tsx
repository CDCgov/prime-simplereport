import React from "react";
import { Link } from "react-router-dom";

interface Props {
  crumbs: { text: string; link: string }[];
}

const Breadcrumbs = ({ crumbs }: Props): React.ReactElement => {
  const [current] = crumbs.slice(-1);
  const trail = crumbs.slice(0, -1);

  return (
    <nav className="usa-breadcrumb" aria-label="Breadcrumbs">
      <ol className="usa-breadcrumb__list">
        {trail.map((crumb) => (
          <li key={crumb.text} className="usa-breadcrumb__list-item">
            <Link to={crumb.link} className="usa-breadcrumb__link">
              <span>{crumb.text}</span>
            </Link>
          </li>
        ))}
        <li
          key={current.text}
          className="usa-breadcrumb__list-item usa-current"
          aria-current="page"
        >
          <span>{current.text}</span>
        </li>
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
