import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import USAGovBanner from "../USAGovBanner";

const Page: React.FC<{}> = ({ children }) => (
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
  </div>
);

export default Page;
