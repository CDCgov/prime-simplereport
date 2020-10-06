import React from "react";

class Header extends React.Component {
  render() {
    return (
      <header className="usa-header usa-header--basic prime-nav">
        <div className="usa-nav-container">
          <div className="usa-nav-bar">
            <h1 className="app-title">PRIME Data Input MVP</h1>
          </div>
        </div>
      </header>
    );
  }
}

export default Header;
