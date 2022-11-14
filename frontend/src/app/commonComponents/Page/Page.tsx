import React, { useEffect } from "react";

import { getUrl } from "../../utils/url";
import USAGovBanner from "../USAGovBanner";
import SRToastContainer from "../SRToastContainer";

declare global {
  interface Window {
    Cypress?: any; // don't really need strict type here
  }
}

interface Props {
  header?: React.ReactNode;
  children?: React.ReactNode;
  isPatientApp?: boolean;
}

const Page: React.FC<Props> = ({ header, children, isPatientApp }) => {
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
      <a className="usa-skipnav" href="#main-wrapper">
        Skip to main content
      </a>
      <header
        className={
          isPatientApp
            ? "header border-bottom border-base-lighter"
            : "usa-header usa-header--basic"
        }
      >
        <USAGovBanner />
        {header}
      </header>
      <main id="main-wrapper">
        {children}
        <SRToastContainer />
      </main>
      <footer>
        {/*  Disabling Touchpoints until we have designs that specify how to contact Support */}
        {/*<TouchpointsButton />*/}
      </footer>
    </div>
  );
};

export default Page;
