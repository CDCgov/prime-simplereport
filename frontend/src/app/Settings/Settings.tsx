import React from "react";
import { Link, NavLink } from "react-router-dom";

const Settings = () => {
  return (
    <main className="prime-home">
      <div className="grid-container">
        <nav aria-label="Secondary navigation">
          <ul className="usa-nav__secondary-links prime-nav">
            <li className="usa-nav__secondary-item">
              <a href="" className="usa-current">
                Current page
              </a>
            </li>
            <li className="usa-nav__secondary-item">
              <a href="">Parent link</a>
            </li>
            <li className="usa-nav__secondary-item">
              <a href="">Parent link</a>
            </li>
          </ul>
        </nav>
      </div>
    </main>
    // <header className="usa-header usa-header--basic">
    //   <li className="usa-nav__primary-item">
    //     <NavLink
    //       to={`/settings`}
    //       onClick={() => setMenuVisible(false)}
    //       activeClassName="active-nav-item"
    //       activeStyle={{
    //         color: "white",
    //       }}
    //     ></NavLink>
    //   </li>
    // </header>
  );
};

export default Settings;
