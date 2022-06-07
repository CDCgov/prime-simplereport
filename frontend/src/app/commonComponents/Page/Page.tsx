import React, { useEffect } from "react";
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import TouchpointsButton from "../../analytics/TouchpointsButton";
import USAGovBanner from "../USAGovBanner";

const Page: React.FC<{}> = ({ children }) => {
  // load touchpoints script
  useEffect(() => {
    const script = document.createElement("script");

    script.src = "/touchpoints.js";
    script.async = true;

    document.body.appendChild(script);
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
