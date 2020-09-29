import React from "react";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// import { userPropTypes } from "../propTypes";
// import "../../styles/App.css";
// import Axios from "axios";
// import Button from "./Button";

class Header extends React.Component {
  //   static propTypes = {
  //     user: userPropTypes
  //   };

  render() {
    // let logout = null;
    // let userSection = null;

    // if (this.props.user) {
    //   logout = (
    //     <Button
    //       onClick={async () => {
    //         await Axios.get(`/logout`);
    //         window.location.href = "/";
    //       }}
    //       label="Logout"
    //       addClass="usa-button"
    //     />
    //   );

    //   userSection = (
    //     <span className="smeqa-rr-nav__user">
    //       <FontAwesomeIcon icon="user" /> {this.props.user.user.email}
    //     </span>
    //   );
    // }

    return (
      <header className="usa-header usa-header--basic">
        <div className="usa-nav-container">
          <div className="usa-nav-bar">
            <a href="/" className="">
              <h1 className="">PRIME Data Input MVP</h1>
            </a>
          </div>
          {/* {userSection} */}
          {/* {logout} */}
        </div>
      </header>
    );
  }
}

export default Header;
