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

const Page: React.FC<{}> = ({ children }) => {
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
      <div id="main-wrapper">
        <USAGovBanner />
        {children}
        <ToastContainer
          autoClose={5000}
          closeButton={false}
          limit={2}
          position="bottom-center"
          hideProgressBar={true}
        />
      </div>
      <TouchpointsButton />
    </div>
  );
};

export default Page;
