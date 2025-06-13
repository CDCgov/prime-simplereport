import React, { useEffect } from "react";

import { getUrl } from "../../utils/url";
import USAGovBanner from "../USAGovBanner";
import SRToastContainer from "../SRToastContainer";
import TouchpointsButton from "../../analytics/TouchpointsButton";
import "./Page.scss";

declare global {
  interface Window {
    Cypress?: any; // don't really need strict type here
  }
}

interface Props {
  header?: React.ReactNode;
  children?: React.ReactNode;
  isPatientApp?: boolean;
  isPilotApp?: boolean;
}

const Page: React.FC<Props> = ({
  header,
  children,
  isPatientApp,
  isPilotApp,
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
          : `${urlPrefix}touchpoints.js`;
      script.async = true;

      document.body.appendChild(script);
    }
  }, []);

  let headerClassName = "usa-header usa-header--basic";

  if (isPatientApp) {
    headerClassName = "header border-bottom border-base-lighter";
  }
  if (isPilotApp) {
    headerClassName = "usa-header usa-header--basic pilot-header";
  }

  return (
    <div className="App">
      <a className="usa-skipnav" href="#main-wrapper">
        Skip to main content
      </a>
      <header className={headerClassName}>
        <USAGovBanner />
        {header}
      </header>
      <main id="main-wrapper">
        {children}
        <SRToastContainer />
      </main>
      <footer>
        <TouchpointsButton />
      </footer>
    </div>
  );
};

export default Page;
