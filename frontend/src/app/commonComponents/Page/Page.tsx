import React, { useEffect } from "react";

import { getUrl } from "../../utils/url";
import SRToastContainer from "../SRToastContainer";
import TouchpointsButton from "../../analytics/TouchpointsButton";

declare global {
  interface Window {
    Cypress?: any; // don't really need strict type here
  }
}

interface Props {
  header?: React.ReactNode;
  children?: React.ReactNode;
}

const Page: React.FC<Props> = ({ header, children }) => {
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

  return (
    <div className="App">
      <a className="usa-skipnav" href="#main-wrapper">
        Skip to main content
      </a>
      {header}
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
