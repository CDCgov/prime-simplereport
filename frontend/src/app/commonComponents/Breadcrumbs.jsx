import React from "react";

const Breadcrumbs = (props) => {
  const crumbs = props.crumbs || [{}];
  const [current] = crumbs.slice(-1);

  return (
    <nav className="usa-breadcrumb" aria-label="Breadcrumbs">
      <ol className="usa-breadcrumb__list">
        {crumbs.slice(0, -1).map((crumb) => (
          <li key={crumb.text} className="usa-breadcrumb__list-item">
            <a href={crumb.link} className="usa-breadcrumb__link">
              <span>{crumb.text}</span>
            </a>
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
