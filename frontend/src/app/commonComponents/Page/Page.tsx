import React, { useEffect } from "react";
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import TouchpointsButton from "../../analytics/TouchpointsButton";
import { getUrl } from "../../utils/url";
import USAGovBanner from "../USAGovBanner";

declare global {
  interface Window {
    Cypress?: any; // don't really need strict type here
  }
}

interface Props {
  header?: React.ReactNode;
  children?: React.ReactNode;
  isPatientApp?: boolean;
  isModalActive?: boolean;
}

const Page: React.FC<Props> = ({
  header,
  children,
  isPatientApp,
  isModalActive,
}) => {
  // load touchpoints script
  useEffect(() => {
    // don't load script when running in cypress
    if (!window.Cypress) {
      const script = document.createElement("script");
      const urlPrefix = getUrl(true);

      script.src =
        process.env.PUBLIC_URL && urlPrefix.includes(process.env.PUBLIC_URL)
          ? `${urlPrefix}static/touchpoints.js`
          : "touchpoints.js";
      script.async = true;

      document.body.appendChild(script);
    }
  }, []);
  return (
    <div className="App">
      <a
        className="usa-skipnav"
        href="#main-wrapper"
        aria-hidden={isModalActive}
      >
        Skip to main content
      </a>
      <header
        className={
          isPatientApp
            ? "header border-bottom border-base-lighter"
            : "usa-header usa-header--basic"
        }
        aria-hidden={isModalActive}
      >
        <USAGovBanner />
        {header}
      </header>
      <div id="main-wrapper">
        {children}
        <ToastContainer
          autoClose={5000}
          closeButton={false}
          limit={2}
          position="bottom-center"
          hideProgressBar={true}
        />
        <TouchpointsButton isModalActive={isModalActive} />
      </div>
    </div>
  );
};

export default Page;
